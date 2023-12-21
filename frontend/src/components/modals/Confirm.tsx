import { forwardRef } from 'react'
import { View } from 'react-native'
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet'
import { Button, Text } from '@ui-kitten/components'

interface ConfirmModalProps {
  title: string
  message?: string
  onPressConfirm: () => void
  onPressCancel?: () => void
  confirmBtnText: string
  confirmBtnStyle?: string
  cancelBtnText: string
  snapPoints: string[]
}

export const ConfirmModal = forwardRef<BottomSheetModal, ConfirmModalProps>(
  function CancelRide(props, ref) {
    const {
      title,
      message,
      onPressConfirm,
      onPressCancel,
      confirmBtnText,
      confirmBtnStyle,
      cancelBtnText,
      snapPoints
    } = props

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        backdropComponent={(props) => <BottomSheetBackdrop {...props} />}
        enableContentPanningGesture={false}
        enableHandlePanningGesture={false}
        handleIndicatorStyle={{ display: 'none' }}
      >
        <BottomSheetView
          style={{ flex: 1, alignItems: 'stretch', paddingTop: 10, paddingHorizontal: 20 }}
        >
          <View style={{ alignItems: 'center', gap: 5 }}>
            <Text category="h5">{title}</Text>
            {message && <Text category="p1">{message}</Text>}
          </View>
          <View
            style={{
              flex: 1,
              flexDirection: 'column',
              gap: 10,
              paddingVertical: 20
            }}
          >
            <Button
              size="large"
              status={confirmBtnStyle ?? 'danger'}
              style={{ borderRadius: 12 }}
              onPress={onPressConfirm}
            >
              {confirmBtnText}
            </Button>
            <Button
              size="large"
              status="basic"
              style={{ borderRadius: 12 }}
              onPress={onPressCancel ?? ref?.current?.close}
            >
              {cancelBtnText}
            </Button>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    )
  }
)
