import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { X } from 'lucide-react-native';

export default function ActionBtn({
  onPress,
  disabled,
  loading,
  label,
  loadingLabel,
  color,
  style,
  onCancel,
}) {
  const showCancel = loading && onCancel;

  return (
    <View style={[showCancel ? styles.actionBtnRow : null, style]}>
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={[
          styles.actionBtn,
          { backgroundColor: color, opacity: disabled ? 0.42 : 1 },
          showCancel ? { flex: 1 } : null,
        ]}
      >
        {loading ? (
          <>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={[styles.actionBtnText, { marginLeft: 9 }]}>{loadingLabel}</Text>
          </>
        ) : (
          <Text style={styles.actionBtnText}>{label}</Text>
        )}
      </TouchableOpacity>

      {showCancel && (
        <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
          <X size={15} color="#EB5A46" />
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = {
  actionBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 16,
  },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(235,90,70,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(235,90,70,0.30)',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  cancelBtnText: {
    color: '#EB5A46',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 6,
  },
};
