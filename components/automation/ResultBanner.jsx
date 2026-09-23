import React from 'react';
import { View, Text } from 'react-native';
import { CheckCircle, XCircle } from 'lucide-react-native';

export default function ResultBanner({ result, style }) {
  const ok = result?.success;
  return (
    <View style={[styles.resultBanner, ok ? styles.resultBannerOk : styles.resultBannerErr, style]}>
      {ok ? (
        <CheckCircle size={17} color="#4ade80" style={{ marginRight: 10, marginTop: 1 }} />
      ) : (
        <XCircle size={17} color="#EB5A46" style={{ marginRight: 10, marginTop: 1 }} />
      )}
      <View style={{ flex: 1 }}>
        <Text style={[styles.resultTitle, { color: ok ? '#4ade80' : '#EB5A46' }]}>
          {ok ? 'Success' : 'Error'}
        </Text>
        <Text style={styles.resultMessage}>
          {ok
            ? result.message || result.board?.name || result.boardUrl || 'Done'
            : result.error || 'Something went wrong'}
        </Text>
      </View>
    </View>
  );
}

const styles = {
  resultBanner: {
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
  },
  resultBannerOk: {
    backgroundColor: 'rgba(74,222,128,0.07)',
    borderColor: 'rgba(74,222,128,0.22)',
  },
  resultBannerErr: {
    backgroundColor: 'rgba(235,90,70,0.07)',
    borderColor: 'rgba(235,90,70,0.22)',
  },
  resultTitle: { fontWeight: '700', fontSize: 13, marginBottom: 3 },
  resultMessage: { color: '#a1a1aa', fontSize: 13, lineHeight: 18 },
};
