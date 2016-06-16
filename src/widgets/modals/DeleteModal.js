/* @flow weak */

/**
 * OfflineMobile Android ConfirmModal
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import {
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { Button } from '../Button';
import Modal from 'react-native-modalbox';
import globalStyles, { SUSSOL_ORANGE, WARM_GREY } from '../../globalStyles';

export function DeleteModal(props) {
  const { onCancel, onConfirm, questionText, ...modalProps } = props;
  return (
    <Modal {...modalProps}
      style={localStyles.modal}
    >
      <View style={localStyles.buttonContainer}>
        <Text style={[globalStyles.text, localStyles.questionText]}>
          {questionText}
        </Text>
        <Button
          style={[globalStyles.button, localStyles.cancelButton]}
          textStyle={[globalStyles.buttonText, localStyles.buttonText]}
          text={'Cancel'}
          onPress={onCancel}
        />
        <Button
          style={[globalStyles.button, localStyles.deleteButton]}
          textStyle={[globalStyles.buttonText, localStyles.buttonText]}
          text={'Delete'}
          onPress={onConfirm}
        />
      </View>
    </Modal>
   );
}

DeleteModal.propTypes = {
  style: View.propTypes.style,
  isOpen: React.PropTypes.bool.isRequired,
  questionText: React.PropTypes.string.isRequired,
  onCancel: React.PropTypes.func.isRequired,
  onConfirm: React.PropTypes.func.isRequired,
};
DeleteModal.defaultProps = {
  style: {},
  globalStyles: {},
  swipeToClose: false, // negating the default.
  backdropPressToClose: false, // negating the default.
  position: 'bottom',
  backdrop: false,
};

const localStyles = StyleSheet.create({
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 5,
  },
  modal: {
    height: 60,
    backgroundColor: WARM_GREY,
  },
  questionText: {
    color: 'white',
    fontSize: 22,
    paddingRight: 10,
  },
  buttonText: {
    color: 'white',
  },
  cancelButton: {
    borderColor: 'white',
  },
  deleteButton: {
    borderColor: 'white',
    backgroundColor: SUSSOL_ORANGE,
  },
});
