/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

 /* @flow weak */

 /**
  * OfflineMobile Android Index
  * Sustainable Solutions (NZ) Ltd. 2016
  */

import React, {
 Component,
 StyleSheet,
 Text,
 TextInput,
 View,
} from 'react-native';

import {
 Cell,
 DataTable,
 Expansion,
 Header,
 HeaderCell,
 Row,
} from '../widgets/DataTable';

import DropDown from 'react-native-dropdown';
const {
  Option,
  OptionList,
  Select,
  updatePosition,
} = DropDown;

import { getItemQuantity } from '../utilities';
import { ListView } from 'realm/react-native';
import globalStyles from '../globalStyles';

export default class StockPage extends Component {
  constructor(props) {
    super(props);
    const dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    this.state = {
      dataSource,
      query: 'item_name=@',
      items: props.database.objects('Item'),
      category: '',
      sortBy: 'name',
      reverseSort: false,
    };
    this.componentWillMount = this.componentWillMount.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onColumnSort = this.onColumnSort.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.renderExpansion = this.renderExpansion.bind(this);
    this.renderRow = this.renderRow.bind(this);
    this.setCategory = this.setCategory.bind(this);
    this.getCategoryOptionList = this.getCategoryOptionList.bind(this);
  }

  componentWillMount() {
    const data = this.state.items.sorted(this.state.sortBy);
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(data),
      deleteTargetItem: this.state.items[0],
    });
  }

  componentDidMount() {
    console.log('componentDidMount HERERR');
    updatePosition(this.refs.SELECT);
    updatePosition(this.refs.OPTIONLIST);
  }

  onSearchChange(event) {
    const term = event.nativeEvent.text;
    const { items, sortBy, category, dataSource, reverseSort } = this.state;
    const data = items
      .filtered(`category.name CONTAINS[c] $0 && ${sortBy} CONTAINS[c] $1`, category, term)
      .sorted(sortBy, reverseSort);
    this.setState({
      dataSource: dataSource.cloneWithRows(data),
    });
  }

  onColumnSort() {
    this.setState({
      reverseSort: this.state.reverseSort !== true,
    });
    const data = this.state.items.sorted(this.state.sortBy, this.state.reverseSort);
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(data),
    });
  }

  renderHeader() {
    return (
      <Header style={globalStyles.dataTableHeader}>
        <HeaderCell
          style={[globalStyles.dataTableCell, globalStyles.dataTableHeaderCell]}
          textStyle={[globalStyles.text, styles.text]}
          onPress={() => this.onColumnSort('code')}
          width={columnWidths[0]}
          text={'ITEM CODE'}
        />
        <HeaderCell
          style={[globalStyles.dataTableCell, globalStyles.dataTableHeaderCell]}
          textStyle={[globalStyles.text, styles.text]}
          width={columnWidths[1]}
          onPress={() => this.onColumnSort('name')}
          text={'ITEM NAME'}
        />
        <HeaderCell
          style={[globalStyles.dataTableHeaderCell]}
          textStyle={[globalStyles.text, styles.text]}
          width={columnWidths[2]}
          text={'STOCK ON HAND'}
        />
      </Header>
    );
  }

  renderExpansion(item) {
    return (
      <Expansion>
        <View style={{ flex: columnWidths[0] }} />
        <View style={{ flex: columnWidths[1], flexDirection: 'row' }}>
          <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'space-around' }}>
            <Text style={[globalStyles.text, styles.text]}>Category: {item.category.name}</Text>
            <Text style={[globalStyles.text, styles.text]}>Department: {item.department.name}</Text>
          </View>
          <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'space-around' }}>
            <Text style={[globalStyles.text, styles.text]}>
              Number of batches: {item.lines.length}
            </Text>
            <Text style={[globalStyles.text, styles.text]}>
              Nearest expiry: value
            </Text>
          </View>
        </View>
        <View style={{ flex: columnWidths[2] }} />
      </Expansion>
    );
  }

  renderRow(item) {
    return (
      <Row style={globalStyles.dataTableRow} renderExpansion={() => this.renderExpansion(item)}>
        <Cell
          style={globalStyles.dataTableCell}
          textStyle={[globalStyles.text, styles.text]}
          width={columnWidths[0]}
        >
          {item.code}
        </Cell>
        <Cell
          style={globalStyles.dataTableCell}
          textStyle={[globalStyles.text, styles.text]}
          width={columnWidths[1]}
        >
          {item.name}
        </Cell>
        <Cell
          style={[globalStyles.dataTableCell, styles.cellLast]}
          textStyle={[globalStyles.text, styles.text]}
          width={columnWidths[2]}
        >
          {getItemQuantity(item)}
        </Cell>
      </Row>
    );
  }

  setCategory(categoryName) {
    this.setState({
      category: categoryName,
    });
  }

  getCategoryOptionList() {
    console.log('this was called');
    return this.refs.OPTIONLIST;
  }

  render() {
    console.log(`Category: ${this.state.category}`);
    return (
      <View style={globalStyles.pageContentContainer}>
        <View style={styles.horizontalContainer}>
          <TextInput
            style={[globalStyles.dataTableSearchBar, { flex: 1 }]}
            onChange={(event) => this.onSearchChange(event)}
            placeholder="Search"
          />
          <Select
            style={[globalStyles.dataTableDropDown, { flex: 0.5 }]}
            ref="SELECT"
            optionListRef={this.getCategoryOptionList}
            defaultValue={'Category'}
            onSelect={this.setCategory}
          >
            {
              this.props.database.objects('ItemCategory').map(category =>
                <Option>{category.name}</Option>
              )
            }
          </Select>

        </View>
        <DataTable
          style={globalStyles.dataTable}
          listViewStyle={globalStyles.container}
          dataSource={this.state.dataSource}
          renderRow={this.renderRow}
          renderHeader={this.renderHeader}
        />
        <OptionList ref="OPTIONLIST" />
      </View>
    );
  }
}

StockPage.propTypes = {
  database: React.PropTypes.object,
  style: View.propTypes.style,
};
const columnWidths = [1.3, 7.2, 1.6];
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  horizontalContainer: {
    flexDirection: 'row',
  },
  text: {
    fontSize: 20,
    marginLeft: 20,
    textAlign: 'left',
  },
  cellLast: {
    borderRightWidth: 0,
  },
  dataTable: {
    flex: 1,
  },
});
