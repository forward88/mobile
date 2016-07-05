/* @flow weak */

/**
 * OfflineMobile Android
 * Sustainable Solutions (NZ) Ltd. 2016
 */


import React from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

import { generateUUID } from '../database';
import { Button, BottomModal, TextInput, ToggleBar } from '../widgets';
import globalStyles from '../globalStyles';
import { GenericTablePage } from './GenericTablePage';

const DATA_TYPES_DISPLAYED = ['Item', 'StocktakeItem'];

/**
* Renders the page for managing a stocktake.
* @prop   {Realm}               database    App wide database.
* @prop   {func}                navigateTo  CallBack for navigation stack.
* @state  {Realm.Results}       items       Filtered to have only Items.
*/
export class StocktakeManagePage extends GenericTablePage {
  constructor(props) {
    super(props);
    this.state.items = props.database.objects('Item');
    this.state.stocktake = {};
    this.state.stocktakeName = '';
    this.state.isNewStocktake = false;
    this.state.searchTerm = '';
    this.state.isAscending = true;
    this.state.isSelectAllItems = false;
    this.state.showNoStock = false;
    this.state.sortBy = 'name';
    this.columns = COLUMNS;
    this.dataTypesDisplayed = DATA_TYPES_DISPLAYED;
    this.onColumnSort = this.onColumnSort.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.renderRow = this.renderRow.bind(this);
    this.getUpdatedData = this.getUpdatedData.bind(this);
    this.onConfirmPress = this.onConfirmPress.bind(this);
  }

  componentWillMount() {
    this.databaseListenerId = this.props.database.addListener(this.onDatabaseEvent);
    if (!this.props.stocktake) {
      let stocktake;
      this.props.database.write(() => {
        const date = new Date();
        stocktake = this.props.database.create('Stocktake', {
          id: generateUUID(),
          name: 'New Stocktake',
          createdDate: date,
          status: 'new',
          comment: 'Testing StocktakesPage',
          serialNumber: '1337',
          lines: [],
        });
      });
      this.setState({ stocktake: stocktake, isNewStocktake: true });
    } else {
      const selected = [];
      this.props.stocktake.lines.forEach((line) => {
        const item = line.itemLine.item;
        if (item) selected.push(item.id);
      });
      this.setState({
        stocktake: this.props.stocktake,
        selection: selected,
        stocktakeName: this.props.stocktake.name,
      });
    }
    this.refreshData();
  }

  onColumnSort(newSortBy) {
    if (this.state.sortBy === newSortBy) { // changed column sort direction.
      this.setState({ isAscending: !this.state.isAscending });
    } else { // Changed sorting column.
      this.setState({
        sortBy: newSortBy,
        isAscending: true,
      });
    }
    this.refreshData();
  }

  onConfirmPress() {
    const { stocktake, selection, items } = this.state;
    const { database, navigateTo } = this.props;
    let { stocktakeName } = this.state;
    const stocktakeLines = [];

    function getDateTimeString(date) {
      return `${date.getDate()}.${date.getMonth()}.${date.getFullYear()} ` +
             `${date.getHours()}:${date.getMinutes()}`;
    }

    if (stocktakeName === '') {
      stocktakeName = `Stocktake ${getDateTimeString(stocktake.createdDate)}`;
    }

    database.write(() => {
      stocktake.lines.forEach((line, i, lines) => {
        const item = line.itemLine.item;
        const itemIdIndex = selection.indexOf(item.id);
        // If a stocktakeLine for an item already exists in the stocktake, remove it from the
        // selection array.
        if (itemIdIndex >= 0) {
          selection.slice(itemIdIndex, 1);
        }
        // Remove stocktakeLines of items that are not in the selection.
        if (!selection.includes(item.id)) lines.slice(i, 1);
      });

      selection.forEach((itemId) => {
        const item = items.find(i => i.id === itemId);
        item.lines.forEach((itemLine) => {
          const stocktakeLine = database.create('StocktakeLine', {
            id: generateUUID(),
            stocktake: stocktake,
            itemLine: itemLine,
            snapshotNumberOfPacks: itemLine.numberOfPacks,
            packSize: 1,
            expiryDate: itemLine.expiryDate,
            batch: itemLine.batch,
            costPrice: itemLine.costPrice,
            sellPrice: itemLine.sellPrice,
          });
          stocktakeLines.push(stocktakeLine);
        });
      });

      stocktake.name = stocktakeName;
      stocktakeLines.forEach(line => stocktake.lines.push(line));
      this.props.database.update('Stocktake', stocktake);
    });
    navigateTo('stocktakeEditor', stocktake.name, { stocktake: stocktake });
  }

  toggleSelectAllItems() {
    const isSelectAllItems = !this.state.isSelectAllItems;
    const { items } = this.state;
    this.setState({
      isSelectAllItems: isSelectAllItems,
      selection: isSelectAllItems ? items.map(item => item.id) : [],
    }, this.refreshData);
  }

  toggleShowNoStock() {
    this.setState({
      showNoStock: !this.state.showNoStock,
    });
    this.refreshData();
  }

  /**
   * Updates data within dataSource in state according to SortBy and
   * isAscending.
   */
  getUpdatedData(searchTerm, sortBy, isAscending) {
    const {
      items,
      selection,
      showNoStock,
    } = this.state;
    let data;
    data = items.filtered(`name CONTAINS[c] "${searchTerm}"`);
    switch (sortBy) {
      // 'selected' case lists the selected items in alphabetical order, followed by unselected in
      // alphabetical order. This requires the selection array to store the item ids in the
      // same alphabetical order as their respective items.
      case 'selected':
        selection.sort((a, b) => {
          const aName = items.find(item => item.id === a).name;
          const bName = items.find(item => item.id === b).name;
          return bName.localeCompare(aName);
        });
        data = data.sorted('name', !isAscending).slice()
                  .sort((a, b) => selection.indexOf(b.id) - selection.indexOf(a.id));
        if (!isAscending) data.reverse();
        break;
      default:
        data = data.sorted(sortBy, !isAscending);
    }
    if (!showNoStock) {
      data = data.slice().filter((item) => item.getTotal !== 0);
    }
    return data;
  }

  renderCell(key, item) {
    switch (key) {
      default:
      case 'code':
        return item.code;
      case 'name':
        return item.name;
      case 'snapshotQuantity':
        return 1337;
      case 'selected':
        return {
          type: 'checkable',
        };
    }
  }

  render() {
    const { isSelectAllItems, showNoStock } = this.state;
    return (
      <View style={globalStyles.pageContentContainer}>
        <View style={globalStyles.container}>
          <View style={globalStyles.pageTopSectionContainer}>
            {this.renderSearchBar()}
            <View style={localStyles.toggleBarView}>
              <ToggleBar
                style={globalStyles.toggleBar}
                textOffStyle={globalStyles.toggleText}
                textOnStyle={globalStyles.toggleTextSelected}
                toggleOffStyle={globalStyles.toggleOption}
                toggleOnStyle={globalStyles.toggleOptionSelected}
                toggles={[
                  {
                    text: 'Show No Stock',
                    onPress: () => this.toggleShowNoStock(),
                    isOn: showNoStock,
                  },
                  {
                    text: 'Select All Items',
                    onPress: () => this.toggleSelectAllItems(),
                    isOn: isSelectAllItems,
                  },
                ]}
              />
            </View>
          </View>
          {this.renderDataTable()}
          <BottomModal
            isOpen={this.state.selection.length > 0}
            style={localStyles.bottomModal}
          >
            <TextInput
              style={globalStyles.modalTextInput}
              textStyle={globalStyles.modalText}
              placeholderTextColor="white"
              placeholder="Give your stocktake a name"
              value={this.state.stocktakeName}
              onChange={(text) => this.setState({ stocktakeName: text })}
            />
            <Button
              style={[globalStyles.button, globalStyles.modalOrangeButton]}
              textStyle={[globalStyles.buttonText, globalStyles.modalButtonText]}
              text={this.state.isNewStocktake ? 'Create' : 'Confirm'}
              onPress={() => this.onConfirmPress()}
            />
          </BottomModal>
        </View>
      </View>
    );
  }
}

StocktakeManagePage.propTypes = {
  stocktake: React.PropTypes.object,
  database: React.PropTypes.object.isRequired,
  navigateTo: React.PropTypes.func.isRequired,
};

const COLUMNS = [
  {
    key: 'code',
    width: 2,
    title: 'ITEM CODE',
    sortable: true,
  },
  {
    key: 'name',
    width: 6,
    title: 'ITEM NAME',
    sortable: true,
  },
  {
    key: 'snapshotQuantity',
    width: 2,
    title: 'SNAPSHOT QUANTITY',
  },
  {
    key: 'selected',
    width: 1,
    title: 'SELECTED',
  },
];

const localStyles = StyleSheet.create({
  bottomModal: {
    justifyContent: 'space-between',
    paddingLeft: 20,
  },
  toggleBarView: {
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});
