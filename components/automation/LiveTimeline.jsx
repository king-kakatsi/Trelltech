import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const LOG_TYPE_CONFIG = {
  info: { color: '#0079BF', prefix: '›' },
  warn: { color: '#F2D600', prefix: '⚠' },
  error: { color: '#EB5A46', prefix: '✗' },
  success: { color: '#4ade80', prefix: '✓' },
};

function formatElapsedTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = String(seconds % 60).padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
}

export default function LiveTimeline({
  logs,
  isRunning,
  elapsed,
  pulseAnim,
  progressAnim,
  scrollRef,
  operationLabel,
  screenW,
}) {
  return (
    <View style={styles.container}>
      {/* Animated shimmer progress bar */}
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressShimmer,
            {
              transform: [
                {
                  translateX: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-(screenW * 0.5), screenW],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={['transparent', 'rgba(0,121,191,0.9)', 'rgba(0,161,239,1)', 'rgba(0,121,191,0.9)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ width: screenW * 0.4, height: 2 }}
          />
        </Animated.View>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Animated.View style={[styles.liveDot, { opacity: pulseAnim }]} />
          <Text style={styles.opLabel}>{operationLabel}</Text>
          {isRunning && (
            <View style={styles.runningPill}>
              <Text style={styles.runningPillText}>LIVE</Text>
            </View>
          )}
        </View>
        <Text style={styles.elapsed}>{formatElapsedTime(elapsed)}</Text>
      </View>

      {/* Entries */}
      <ScrollView
        ref={scrollRef}
        style={styles.logList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 12 }}
      >
        {logs.map((log, index) => (
          <TimelineEntry
            key={log.id}
            log={log}
            isLast={index === logs.length - 1}
            typeConfig={LOG_TYPE_CONFIG[log.type] || LOG_TYPE_CONFIG.info}
          />
        ))}
        {isRunning && <ThinkingDots />}
      </ScrollView>
    </View>
  );
}

function TimelineEntry({ log, isLast, typeConfig }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(fadeAnim, {
      toValue: 1,
      tension: 230,
      friction: 24,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View
      style={[
        styles.entry,
        {
          opacity: fadeAnim,
          transform: [
            { translateX: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [-18, 0] }) },
          ],
        },
      ]}
    >
      <View style={[styles.entryBar, { backgroundColor: typeConfig.color, opacity: isLast ? 1 : 0.3 }]} />
      <Text style={styles.entryTime}>{log.time}</Text>
      <Text style={[styles.entryPrefix, { color: typeConfig.color, opacity: isLast ? 1 : 0.55 }]}>
        {typeConfig.prefix}
      </Text>
      <Text
        style={[styles.entryMsg, { color: isLast ? typeConfig.color : '#4a5568' }]}
        numberOfLines={isLast ? 4 : 2}
      >
        {log.message}
      </Text>
    </Animated.View>
  );
}

function ThinkingDots() {
  const dot1 = useRef(new Animated.Value(0.25)).current;
  const dot2 = useRef(new Animated.Value(0.25)).current;
  const dot3 = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    const makeLoop = (anim) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: 380, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.25, duration: 380, useNativeDriver: true }),
        ]),
      );
    const loop1 = makeLoop(dot1);
    const loop2 = makeLoop(dot2);
    const loop3 = makeLoop(dot3);
    loop1.start();
    const timeout2 = setTimeout(() => loop2.start(), 190);
    const timeout3 = setTimeout(() => loop3.start(), 380);
    return () => {
      loop1.stop();
      loop2.stop();
      loop3.stop();
      clearTimeout(timeout2);
      clearTimeout(timeout3);
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.dotsRow}>
      {[dot1, dot2, dot3].map((opacityAnim, index) => (
        <Animated.View key={index} style={[styles.dot, { opacity: opacityAnim }]} />
      ))}
    </View>
  );
}

const styles = {
  container: {
    backgroundColor: '#080c12',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1a2233',
    overflow: 'hidden',
    minHeight: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 12,
  },
  progressTrack: {
    height: 2,
    backgroundColor: 'rgba(0,121,191,0.12)',
    overflow: 'hidden',
  },
  progressShimmer: {
    position: 'absolute',
    top: 0,
    height: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#1a2233',
    backgroundColor: '#0b0f17',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#4ade80',
  },
  opLabel: {
    color: '#6b7280',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  runningPill: {
    backgroundColor: 'rgba(74,222,128,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.25)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  runningPillText: {
    color: '#4ade80',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.8,
  },
  elapsed: {
    color: '#2a3444',
    fontSize: 11,
    letterSpacing: 0.8,
  },
  logList: {
    maxHeight: 270,
  },
  entry: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  entryBar: {
    width: 2,
    minHeight: 14,
    borderRadius: 2,
    marginRight: 10,
    marginTop: 3,
    alignSelf: 'stretch',
  },
  entryTime: {
    color: '#1e2a3a',
    fontSize: 9,
    minWidth: 66,
    marginRight: 6,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  entryPrefix: {
    fontSize: 11,
    marginRight: 7,
    marginTop: 1,
    fontWeight: '700',
  },
  entryMsg: {
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 14,
    gap: 5,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2a3a50',
  },
};
