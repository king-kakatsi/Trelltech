import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ActivityIndicator,
  ScrollView, TextInput, Dimensions, Animated, Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft, ChevronDown, ChevronUp, ChevronRight,
  Copy, Trash2, Square, CheckCircle, GitBranch, FileText,
  RefreshCw, Upload, X,
} from 'lucide-react-native';
import useAutomationLogs from '../hooks/useAutomationLogs';
import useBoardBuilder from '../hooks/useBoardBuilder';
import useBranchTools from '../hooks/useBranchTools';
import ActionBtn from '../components/automation/ActionBtn';
import ResultBanner from '../components/automation/ResultBanner';
import LiveTimeline from '../components/automation/LiveTimeline';
import s from '../styles/createBoard';

const TABS = [
  { id: 'builder', label: 'Board Builder' },
  { id: 'branch', label: 'Branch Tools' },
];

export default function CreateBoardScreen() {
  const router = useRouter();

  // ── Navigation ──
  const [activeTab, setActiveTab] = useState('builder');

  // ── Shared automation logs ──
  const { logs, logsScrollRef, addLog, runWithLogs, abortedRef } = useAutomationLogs();

  // ── Feature hooks ──
  const builder = useBoardBuilder({ addLog, runWithLogs, abortedRef });
  const branch = useBranchTools({ addLog, runWithLogs, abortedRef });

  // ── Entrance animation ──
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, [fadeAnim]);

  // ── Input ↔ Timeline swap animation ──
  const swapAnim = useRef(new Animated.Value(1)).current;
  const [showTimeline, setShowTimeline] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const wasLoadingRef = useRef(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const SCREEN_W = Dimensions.get('window').width;

  const isAnyLoading = builder.loading || !!branch.branchLoading;

  useEffect(() => {
    const nowLoading = isAnyLoading;
    if (nowLoading === wasLoadingRef.current) return;
    wasLoadingRef.current = nowLoading;
    Animated.timing(swapAnim, { toValue: 0, duration: 210, useNativeDriver: true }).start(() => {
      setShowTimeline(nowLoading);
      Animated.timing(swapAnim, { toValue: 1, duration: 320, useNativeDriver: true }).start();
    });
  }, [isAnyLoading, swapAnim]);

  useEffect(() => {
    if (!isAnyLoading) return;
    setElapsed(0);
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [isAnyLoading]);

  useEffect(() => {
    if (!isAnyLoading) {
      progressAnim.setValue(0);
      return;
    }
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.15, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    const progress = Animated.loop(
      Animated.timing(progressAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
    );
    progress.start();
    return () => {
      pulse.stop();
      progress.stop();
    };
  }, [isAnyLoading, pulseAnim, progressAnim]);

  const handleStop = useCallback(() => {
    abortedRef.current = true;
    builder.clearLoading();
    branch.clearLoading();
    addLog('Process stopped by user', 'warn');
  }, [abortedRef, builder, branch, addLog]);

  const OPERATION_LABELS = {
    comments: 'Branch Comments',
    resources: 'Resource Cards',
    emojis: 'Remove Emojis',
    find: 'Finding Board',
  };

  const operationLabel = builder.loading
    ? 'Creating Board'
    : OPERATION_LABELS[branch.branchLoading] || 'Processing';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1a1a1a' }} edges={['top']}>
      {/* ── Header ── */}
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <ChevronLeft size={20} color="#fff" />
        </Pressable>

        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Automation Studio</Text>
          <Text style={s.headerSub}>Trello board automation tools</Text>
        </View>

        {isAnyLoading && (
          <Pressable onPress={handleStop} style={s.stopBtn}>
            <Square size={11} color="#EB5A46" fill="#EB5A46" />
            <Text style={s.stopBtnText}>Stop</Text>
          </Pressable>
        )}
      </View>

      {/* ── Tab Bar ── */}
      <View style={s.tabBar}>
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[s.tabItem, active && s.tabItemActive]}
            >
              <Text style={[s.tabLabel, active && s.tabLabelActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 52 }}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* ════════════════════════════════════════ */}
          {/*  BOARD BUILDER TAB                       */}
          {/* ════════════════════════════════════════ */}
          {activeTab === 'builder' && (
            <View style={s.tabContent}>
              {/* Collapsible "How it works" */}
              <Pressable
                onPress={() => builder.setShowInstructions((v) => !v)}
                style={s.card}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={[s.iconBubble, { backgroundColor: 'rgba(0,121,191,0.12)' }]}>
                    <FileText size={17} color="#0079BF" />
                  </View>
                  <Text style={[s.cardTitle, { flex: 1, marginLeft: 12 }]}>How it works</Text>
                  {builder.showInstructions ? (
                    <ChevronUp size={17} color="#555" />
                  ) : (
                    <ChevronDown size={17} color="#555" />
                  )}
                </View>

                {builder.showInstructions && (
                  <View style={s.instructionBody}>
                    {[
                      'Finds or creates your organization and board',
                      'Uses existing lists or creates missing ones',
                      'Creates missing labels if needed',
                      'Creates / updates cards with checklists, labels & assignments',
                      'Smart upsert — never creates duplicates',
                    ].map((item, i) => (
                      <View key={i} style={{ flexDirection: 'row', marginBottom: 8 }}>
                        <Text style={{ color: '#0079BF', marginRight: 8 }}>·</Text>
                        <Text style={s.instructionItem}>{item}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </Pressable>

              {/* AI Prompt card */}
              <View style={s.card}>
                <Text style={s.cardTitle}>Generate Markdown with AI</Text>
                <Text style={s.cardBody}>
                  Copy the prompt, paste it into any AI assistant with your project spec to generate board markdown.
                </Text>
                <TouchableOpacity onPress={builder.handleCopyPrompt} style={s.promptBtn}>
                  <Copy size={15} color="#0079BF" />
                  <Text style={s.promptBtnText}>Copy AI Prompt</Text>
                </TouchableOpacity>
              </View>

              {/* ── Input ↔ Timeline swap zone ── */}
              <Animated.View style={{ opacity: swapAnim, marginBottom: 16 }}>
                {showTimeline ? (
                  <LiveTimeline
                    logs={logs}
                    isRunning={isAnyLoading}
                    elapsed={elapsed}
                    pulseAnim={pulseAnim}
                    progressAnim={progressAnim}
                    scrollRef={logsScrollRef}
                    operationLabel={operationLabel}
                    screenW={SCREEN_W}
                  />
                ) : (
                  <View style={s.inputCard}>
                    {/* Header: title + mode switcher */}
                    <View style={s.inputToolbar}>
                      <Text style={s.cardTitle}>Markdown Content</Text>
                      <View style={s.miniTabBar}>
                        <Pressable
                          onPress={() => builder.setInputMode('paste')}
                          style={[s.miniTab, builder.inputMode === 'paste' && s.miniTabActive]}
                        >
                          <Copy size={11} color={builder.inputMode === 'paste' ? '#fff' : '#666'} />
                          <Text
                            style={[
                              s.miniTabText,
                              builder.inputMode === 'paste' && s.miniTabTextActive,
                            ]}
                          >
                            Paste
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() => builder.setInputMode('upload')}
                          style={[s.miniTab, builder.inputMode === 'upload' && s.miniTabActive]}
                        >
                          <Upload size={11} color={builder.inputMode === 'upload' ? '#fff' : '#666'} />
                          <Text
                            style={[
                              s.miniTabText,
                              builder.inputMode === 'upload' && s.miniTabTextActive,
                            ]}
                          >
                            Upload
                          </Text>
                        </Pressable>
                      </View>
                    </View>

                    {/* ── Paste mode ── */}
                    {builder.inputMode === 'paste' && (
                      <>
                        <View style={s.pasteToolbar}>
                          <TouchableOpacity onPress={builder.handlePaste} style={s.toolbarBtn}>
                            <Copy size={12} color="#a1a1aa" />
                            <Text style={s.toolbarBtnText}>Paste</Text>
                          </TouchableOpacity>
                          {builder.markdownContent.length > 0 && (
                            <TouchableOpacity onPress={builder.handleClearContent} style={s.toolbarBtnDanger}>
                              <Trash2 size={12} color="#EB5A46" />
                              <Text style={s.toolbarBtnDangerText}>Clear</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                        <TextInput
                          value={builder.markdownContent}
                          onChangeText={builder.setMarkdownContent}
                          placeholder="Paste markdown content here…"
                          placeholderTextColor="#333"
                          multiline
                          style={s.textArea}
                        />
                        {builder.markdownContent.length > 0 && (
                          <Text style={s.charCount}>
                            {builder.markdownContent.length.toLocaleString()} chars
                          </Text>
                        )}
                      </>
                    )}

                    {/* ── Upload mode ── */}
                    {builder.inputMode === 'upload' && (
                      <View style={s.uploadArea}>
                        {builder.markdownContent.length > 0 && builder.uploadedFile ? (
                          <>
                            <View style={s.fileLoadedCard}>
                              <View style={s.fileIcon}>
                                <FileText size={22} color="#0079BF" />
                              </View>
                              <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={s.fileName} numberOfLines={1}>
                                  {builder.uploadedFile.name}
                                </Text>
                                <Text style={s.fileMeta}>
                                  {formatFileSize(builder.uploadedFile.size)} · {builder.markdownContent.length.toLocaleString()} chars
                                </Text>
                              </View>
                              <CheckCircle size={18} color="#4ade80" style={{ marginRight: 10 }} />
                              <Pressable onPress={builder.handleClearContent} style={s.fileClearBtn}>
                                <X size={14} color="#666" />
                              </Pressable>
                            </View>
                            <TouchableOpacity onPress={builder.handlePickFile} style={s.rePickBtn}>
                              <RefreshCw size={13} color="#0079BF" />
                              <Text style={s.rePickBtnText}>Pick a different file</Text>
                            </TouchableOpacity>
                          </>
                        ) : (
                          <TouchableOpacity
                            onPress={builder.handlePickFile}
                            disabled={builder.pickLoading}
                            style={s.dropZone}
                            activeOpacity={0.7}
                          >
                            {builder.pickLoading ? (
                              <ActivityIndicator color="#555" size="large" />
                            ) : (
                              <>
                                <View style={s.uploadIconRing}>
                                  <Upload size={26} color="#555" />
                                </View>
                                <Text style={s.dropZoneTitle}>Pick a markdown file</Text>
                                <Text style={s.dropZoneSubtitle}>.md · .txt · .markdown</Text>
                              </>
                            )}
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>
                )}
              </Animated.View>

              {/* Action buttons */}
              <ActionBtn
                onPress={builder.handleCreateBoard}
                disabled={builder.loading || !builder.markdownContent.trim()}
                loading={builder.loading}
                label="Create Cards in Board"
                loadingLabel="Creating cards…"
                color="#0079BF"
                style={{ marginBottom: 4 }}
                onCancel={handleStop}
              />

              {builder.builderResult && <ResultBanner result={builder.builderResult} style={{ marginTop: 16 }} />}
            </View>
          )}

          {/* ════════════════════════════════════════ */}
          {/*  BRANCH TOOLS TAB                        */}
          {/* ════════════════════════════════════════ */}
          {activeTab === 'branch' && (
            <View style={s.tabContent}>
              {/* Board target card */}
              <View style={s.card}>
                <Text style={s.cardTitle}>Target Board</Text>

                {branch.boardId ? (
                  <View style={s.boardIdRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.boardIdLabel}>Board ID</Text>
                      <Text style={s.boardIdValue} numberOfLines={1}>
                        {branch.boardId}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={branch.handleFindBoard} style={s.refreshBtn}>
                      <RefreshCw size={14} color="#666" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <Text style={[s.cardBody, { marginTop: 6 }]}>
                      Auto-detect your active board from the first workspace.
                    </Text>
                    <ActionBtn
                      onPress={branch.handleFindBoard}
                      disabled={branch.branchLoading === 'find'}
                      loading={branch.branchLoading === 'find'}
                      label="Auto-Find Board"
                      loadingLabel="Searching…"
                      color="#61BD4F"
                      style={{ marginTop: 14 }}
                    />
                  </>
                )}
              </View>

              {/* Section label */}
              <Text style={s.sectionLabel}>Actions</Text>

              {/* Action rows */}
              {BRANCH_ACTIONS.map((action) => {
                const Icon = action.icon;
                const isActive = branch.branchLoading === action.id;
                const disabled = !branch.boardId || !!branch.branchLoading;
                return (
                  <Pressable
                    key={action.id}
                    onPress={() => !isActive && branch.handleBranchAction(action.id)}
                    disabled={disabled && !isActive}
                    style={[s.branchCard, { opacity: disabled && !isActive ? 0.42 : 1 }]}
                  >
                    <View style={[s.iconBubble, { backgroundColor: `${action.color}18`, marginRight: 14 }]}>
                      {isActive ? (
                        <ActivityIndicator size="small" color={action.color} />
                      ) : (
                        <Icon size={18} color={action.color} />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.branchCardTitle}>{action.title}</Text>
                      <Text style={s.branchCardDesc}>{isActive ? 'Running…' : action.desc}</Text>
                    </View>
                    {isActive ? (
                      <TouchableOpacity onPress={handleStop} style={s.inlineCancelBtn}>
                        <X size={13} color="#EB5A46" />
                      </TouchableOpacity>
                    ) : (
                      <ChevronRight size={16} color="#333" />
                    )}
                  </Pressable>
                );
              })}

              {branch.branchResult && <ResultBanner result={branch.branchResult} style={{ marginTop: 8 }} />}

              {/* Branch tab timeline — appears below branch cards when running */}
              {showTimeline && (
                <Animated.View style={{ opacity: swapAnim, marginTop: 8 }}>
                  <LiveTimeline
                    logs={logs}
                    isRunning={isAnyLoading}
                    elapsed={elapsed}
                    pulseAnim={pulseAnim}
                    progressAnim={progressAnim}
                    scrollRef={logsScrollRef}
                    operationLabel={operationLabel}
                    screenW={SCREEN_W}
                  />
                </Animated.View>
              )}
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Helpers ─────────────────────────────────────────

const formatFileSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ─── Branch action definitions ────────────────────────

const BRANCH_ACTIONS = [
  {
    id: 'comments',
    color: '#0079BF',
    icon: GitBranch,
    title: 'Add Branch Comments',
    desc: 'Add git branch names to all cards (except Week 1)',
  },
  {
    id: 'resources',
    color: '#61BD4F',
    icon: FileText,
    title: 'Add Resource Cards',
    desc: 'Create two resource cards in the Ressources list',
  },
  {
    id: 'emojis',
    color: '#F2D600',
    icon: Trash2,
    title: 'Remove Emojis',
    desc: 'Strip emojis from all card comments',
  },
];

