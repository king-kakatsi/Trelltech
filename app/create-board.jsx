import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ActivityIndicator,
  ScrollView, Alert, TextInput, Platform,
  Animated, Pressable, Clipboard, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft, ChevronDown, ChevronUp, ChevronRight,
  Copy, Trash2, Square, CheckCircle, XCircle,
  GitBranch, FileText, RefreshCw, Zap, Upload, X,
} from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { createBoardFromMarkdown, deleteMarkdownLabelsFromBoard } from '../utils/boardFromMarkdown';
import { addBranchCommentsToBoard, removeEmojisFromComments } from '../utils/addBranchComments';
import { addResourceCards } from '../utils/addResourceCards';
import { getWorkspaceBoards } from '../services/boardService';
import { getAllWorkspaces } from '../services/workspaces';
import { TRELLO_PLANNING_PROMPT } from '../utils/getPlanningPrompt';

const TABS = [
  { id: 'builder', label: 'Board Builder' },
  { id: 'branch', label: 'Branch Tools' },
];

const LOG_COLOR = {
  info: '#a1a1aa',
  warn: '#F2D600',
  error: '#EB5A46',
  success: '#4ade80',
};

export default function CreateBoardScreen() {
  const router = useRouter();

  // ── Navigation ──
  const [activeTab, setActiveTab] = useState('builder');

  // ── Board Builder state ──
  const [loading, setLoading] = useState(false);
  const [cleanLoading, setCleanLoading] = useState(false);
  const [markdownContent, setMarkdownContent] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);
  const [builderResult, setBuilderResult] = useState(null);
  const [inputMode, setInputMode] = useState('paste'); // 'paste' | 'upload'
  const [uploadedFile, setUploadedFile] = useState(null); // { name, size }
  const [pickLoading, setPickLoading] = useState(false);

  // ── Branch Tools state ──
  const [branchLoading, setBranchLoading] = useState(null);
  const [boardId, setBoardId] = useState(null);
  const [branchResult, setBranchResult] = useState(null);

  // ── Shared log state ──
  const [logs, setLogs] = useState([]);
  const logsRef = useRef([]);
  const abortedRef = useRef(false);
  const logsScrollRef = useRef(null);

  // ── Entrance animation ──
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, []);

  // ── Input ↔ Timeline swap animation ──
  const swapAnim = useRef(new Animated.Value(1)).current;
  const [showTimeline, setShowTimeline] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const wasLoadingRef = useRef(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const SCREEN_W = Dimensions.get('window').width;

  useEffect(() => {
    const nowLoading = loading || cleanLoading || !!branchLoading;
    if (nowLoading === wasLoadingRef.current) return;
    wasLoadingRef.current = nowLoading;
    Animated.timing(swapAnim, { toValue: 0, duration: 210, useNativeDriver: true }).start(() => {
      setShowTimeline(nowLoading);
      Animated.timing(swapAnim, { toValue: 1, duration: 320, useNativeDriver: true }).start();
    });
  }, [loading, cleanLoading, branchLoading]);

  useEffect(() => {
    const nowLoading = loading || cleanLoading || !!branchLoading;
    if (!nowLoading) return;
    setElapsed(0);
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [loading, cleanLoading, branchLoading]);

  useEffect(() => {
    const nowLoading = loading || cleanLoading || !!branchLoading;
    if (!nowLoading) {
      progressAnim.setValue(0);
      return;
    }
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.15, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    pulse.start();
    const progress = Animated.loop(
      Animated.timing(progressAnim, { toValue: 1, duration: 1800, useNativeDriver: true })
    );
    progress.start();
    return () => { pulse.stop(); progress.stop(); };
  }, [loading, cleanLoading, branchLoading]);

  // ─── Log system ──────────────────────────────────────

  const clearLogs = useCallback(() => {
    logsRef.current = [];
    setLogs([]);
  }, []);

  const addLog = useCallback((message, type = 'info') => {
    const entry = {
      id: `${Date.now()}-${Math.random()}`,
      message: String(message),
      type,
      time: new Date().toLocaleTimeString('en-GB'),
    };
    logsRef.current = [...logsRef.current, entry];
    setLogs([...logsRef.current]);
    setTimeout(() => logsScrollRef.current?.scrollToEnd({ animated: true }), 60);
  }, []);

  const serialize = (...args) =>
    args
      .map(a => {
        if (typeof a === 'string') return a;
        try { return JSON.stringify(a); } catch { return String(a); }
      })
      .join(' ');

  const runWithLogs = useCallback(
    async (fn) => {
      clearLogs();
      abortedRef.current = false;
      const origLog = console.log;
      const origWarn = console.warn;
      const origError = console.error;
      console.log = (...a) => { origLog(...a); addLog(serialize(...a), 'info'); };
      console.warn = (...a) => { origWarn(...a); addLog(serialize(...a), 'warn'); };
      console.error = (...a) => { origError(...a); addLog(serialize(...a), 'error'); };
      try {
        return await fn();
      } finally {
        console.log = origLog;
        console.warn = origWarn;
        console.error = origError;
      }
    },
    [clearLogs, addLog],
  );

  const handleStop = useCallback(() => {
    abortedRef.current = true;
    setLoading(false);
    setCleanLoading(false);
    setBranchLoading(null);
    addLog('Process stopped by user', 'warn');
  }, [addLog]);

  // ─── Board Builder handlers ───────────────────────────

  const handleCopyPrompt = useCallback(async () => {
    try {
      Clipboard.setString(TRELLO_PLANNING_PROMPT);
      Alert.alert('Copied!', 'Paste it into your AI assistant with your project specification.');
    } catch {
      Alert.alert('Error', 'Failed to copy prompt');
    }
  }, []);

  const handlePaste = useCallback(async () => {
    try {
      const text = await Clipboard.getString();
      if (text) {
        setMarkdownContent(text);
        setUploadedFile(null);
      } else {
        Alert.alert('Clipboard Empty', 'Nothing found in clipboard.');
      }
    } catch {
      Alert.alert('Paste', 'Long-press the text area below to paste manually.');
    }
  }, []);

  const handlePickFile = useCallback(async () => {
    setPickLoading(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/plain', 'text/markdown', 'application/octet-stream', '*/*'],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        const text = await FileSystem.readAsStringAsync(asset.uri);
        setMarkdownContent(text);
        setUploadedFile({ name: asset.name, size: asset.size ?? text.length });
      }
    } catch (err) {
      Alert.alert('Error', 'Could not read file: ' + err.message);
    } finally {
      setPickLoading(false);
    }
  }, []);

  const handleClearContent = useCallback(() => {
    setMarkdownContent('');
    setUploadedFile(null);
  }, []);

  const handleCleanLabels = useCallback(async () => {
    if (!markdownContent.trim()) {
      Alert.alert('Markdown Required', 'Paste your board markdown first.');
      return;
    }
    const confirmed =
      Platform.OS === 'web'
        ? window.confirm('Delete all BUSGO labels from the Bus_go board?')
        : await new Promise(resolve =>
            Alert.alert(
              'Delete BUSGO Labels',
              'Every label matching the markdown will be deleted. Manually-created labels are kept.',
              [
                { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
                { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
              ],
            ),
          );
    if (!confirmed) return;

    setCleanLoading(true);
    setBuilderResult(null);
    try {
      addLog('Deleting BUSGO labels…', 'info');
      const res = await runWithLogs(() => deleteMarkdownLabelsFromBoard(markdownContent));
      if (abortedRef.current) return;
      if (res.success) {
        setBuilderResult({ success: true, message: `Deleted ${res.deleted.length} label(s) · kept ${res.kept.length}` });
        addLog(`Done — deleted ${res.deleted.length}, kept ${res.kept.length}`, 'success');
      } else {
        setBuilderResult({ success: false, error: res.error });
        addLog(`Error: ${res.error}`, 'error');
      }
    } catch (err) {
      if (!abortedRef.current) {
        setBuilderResult({ success: false, error: err.message });
        addLog(`Error: ${err.message}`, 'error');
      }
    } finally {
      setCleanLoading(false);
    }
  }, [markdownContent, addLog, runWithLogs]);

  const handleCreateBoard = useCallback(async () => {
    if (!markdownContent.trim()) {
      Alert.alert('Markdown Required', 'Paste your Trello board organization markdown first.');
      return;
    }
    setLoading(true);
    setBuilderResult(null);
    try {
      addLog('Starting board creation…', 'info');
      const res = await runWithLogs(() => createBoardFromMarkdown(markdownContent));
      if (abortedRef.current) return;
      setBuilderResult(res);
      addLog(
        res.success ? `Board "${res.board?.name}" created!` : `Error: ${res.error}`,
        res.success ? 'success' : 'error',
      );
    } catch (err) {
      if (!abortedRef.current) {
        setBuilderResult({ success: false, error: err.message });
        addLog(`Error: ${err.message}`, 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [markdownContent, addLog, runWithLogs]);

  // ─── Branch Tools handlers ────────────────────────────

  const handleFindBoard = useCallback(async () => {
    setBranchLoading('find');
    setBranchResult(null);
    try {
      const [success, workspaces] = await getAllWorkspaces();
      if (success && Array.isArray(workspaces) && workspaces.length > 0) {
        const boards = await getWorkspaceBoards(workspaces[0].id);
        if (boards?.length > 0) {
          setBoardId(boards[0].id);
          setBranchResult({ success: true, message: `Board found: ${boards[0].name}` });
          addLog(`Found: ${boards[0].name} (${boards[0].id})`, 'success');
        } else {
          setBranchResult({ success: false, error: 'No boards found in workspace' });
        }
      } else {
        setBranchResult({ success: false, error: 'No workspaces found' });
      }
    } catch (err) {
      setBranchResult({ success: false, error: err.message });
    } finally {
      setBranchLoading(null);
    }
  }, [addLog]);

  const handleBranchAction = useCallback(async (actionId) => {
    if (!boardId) {
      Alert.alert('Board Required', 'Auto-find or enter a board ID first.');
      return;
    }
    setBranchLoading(actionId);
    setBranchResult(null);
    try {
      let res;
      if (actionId === 'comments') {
        addLog('Adding branch comments…', 'info');
        res = await runWithLogs(() => addBranchCommentsToBoard(boardId, false, true));
        if (abortedRef.current) return;
        setBranchResult(
          res.success
            ? { success: true, message: `${res.commentedCards ?? 0} new · ${res.updatedCards ?? 0} updated · ${res.totalCards ?? 0} total` }
            : { success: false, error: res.error },
        );
        if (res.success) addLog(`Done — ${res.commentedCards} new, ${res.updatedCards} updated`, 'success');
      } else if (actionId === 'resources') {
        addLog('Creating resource cards…', 'info');
        res = await runWithLogs(() => addResourceCards(boardId));
        if (abortedRef.current) return;
        setBranchResult(
          res.success
            ? { success: true, message: `${res.cards?.length ?? 0} resource cards created` }
            : { success: false, error: res.error },
        );
        if (res.success) addLog(`Created ${res.cards?.length ?? 0} resource cards`, 'success');
      } else if (actionId === 'emojis') {
        addLog('Removing emojis from comments…', 'info');
        res = await runWithLogs(() => removeEmojisFromComments(boardId));
        if (abortedRef.current) return;
        setBranchResult(
          res.success
            ? { success: true, message: `Cleaned ${res.updatedCards ?? 0} comments` }
            : { success: false, error: res.error },
        );
        if (res.success) addLog(`Cleaned ${res.updatedCards} comments`, 'success');
      }
    } catch (err) {
      if (!abortedRef.current) {
        setBranchResult({ success: false, error: err.message });
        addLog(`Error: ${err.message}`, 'error');
      }
    } finally {
      setBranchLoading(null);
    }
  }, [boardId, addLog, runWithLogs]);

  const isAnyLoading = loading || cleanLoading || !!branchLoading;

  const operationLabel =
    loading       ? 'Creating Board'   :
    cleanLoading  ? 'Cleaning Labels'  :
    branchLoading === 'comments'  ? 'Branch Comments' :
    branchLoading === 'resources' ? 'Resource Cards'  :
    branchLoading === 'emojis'    ? 'Remove Emojis'   :
    branchLoading === 'find'      ? 'Finding Board'   : 'Processing';

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
        {TABS.map(tab => {
          const active = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[s.tabItem, active && s.tabItemActive]}
            >
              <Text style={[s.tabLabel, active && s.tabLabelActive]}>
                {tab.label}
              </Text>
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
                onPress={() => setShowInstructions(v => !v)}
                style={s.card}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={[s.iconBubble, { backgroundColor: 'rgba(0,121,191,0.12)' }]}>
                    <FileText size={17} color="#0079BF" />
                  </View>
                  <Text style={[s.cardTitle, { flex: 1, marginLeft: 12 }]}>How it works</Text>
                  {showInstructions
                    ? <ChevronUp size={17} color="#555" />
                    : <ChevronDown size={17} color="#555" />}
                </View>

                {showInstructions && (
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
                <TouchableOpacity onPress={handleCopyPrompt} style={s.promptBtn}>
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
                          onPress={() => setInputMode('paste')}
                          style={[s.miniTab, inputMode === 'paste' && s.miniTabActive]}
                        >
                          <Copy size={11} color={inputMode === 'paste' ? '#fff' : '#666'} />
                          <Text style={[s.miniTabText, inputMode === 'paste' && s.miniTabTextActive]}>
                            Paste
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() => setInputMode('upload')}
                          style={[s.miniTab, inputMode === 'upload' && s.miniTabActive]}
                        >
                          <Upload size={11} color={inputMode === 'upload' ? '#fff' : '#666'} />
                          <Text style={[s.miniTabText, inputMode === 'upload' && s.miniTabTextActive]}>
                            Upload
                          </Text>
                        </Pressable>
                      </View>
                    </View>

                    {/* ── Paste mode ── */}
                    {inputMode === 'paste' && (
                      <>
                        <View style={s.pasteToolbar}>
                          <TouchableOpacity onPress={handlePaste} style={s.toolbarBtn}>
                            <Copy size={12} color="#a1a1aa" />
                            <Text style={s.toolbarBtnText}>Paste</Text>
                          </TouchableOpacity>
                          {markdownContent.length > 0 && (
                            <TouchableOpacity onPress={handleClearContent} style={s.toolbarBtnDanger}>
                              <Trash2 size={12} color="#EB5A46" />
                              <Text style={s.toolbarBtnDangerText}>Clear</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                        <TextInput
                          value={markdownContent}
                          onChangeText={setMarkdownContent}
                          placeholder="Paste markdown content here…"
                          placeholderTextColor="#333"
                          multiline
                          style={s.textArea}
                        />
                        {markdownContent.length > 0 && (
                          <Text style={s.charCount}>
                            {markdownContent.length.toLocaleString()} chars
                          </Text>
                        )}
                      </>
                    )}

                    {/* ── Upload mode ── */}
                    {inputMode === 'upload' && (
                      <View style={s.uploadArea}>
                        {markdownContent.length > 0 && uploadedFile ? (
                          <>
                            <View style={s.fileLoadedCard}>
                              <View style={s.fileIcon}>
                                <FileText size={22} color="#0079BF" />
                              </View>
                              <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={s.fileName} numberOfLines={1}>
                                  {uploadedFile.name}
                                </Text>
                                <Text style={s.fileMeta}>
                                  {formatFileSize(uploadedFile.size)} · {markdownContent.length.toLocaleString()} chars
                                </Text>
                              </View>
                              <CheckCircle size={18} color="#4ade80" style={{ marginRight: 10 }} />
                              <Pressable onPress={handleClearContent} style={s.fileClearBtn}>
                                <X size={14} color="#666" />
                              </Pressable>
                            </View>
                            <TouchableOpacity onPress={handlePickFile} style={s.rePickBtn}>
                              <RefreshCw size={13} color="#0079BF" />
                              <Text style={s.rePickBtnText}>Pick a different file</Text>
                            </TouchableOpacity>
                          </>
                        ) : (
                          <TouchableOpacity
                            onPress={handlePickFile}
                            disabled={pickLoading}
                            style={s.dropZone}
                            activeOpacity={0.7}
                          >
                            {pickLoading ? (
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
                onPress={handleCreateBoard}
                disabled={loading || !markdownContent.trim()}
                loading={loading}
                label="Create Cards in Board"
                loadingLabel="Creating cards…"
                color="#0079BF"
                style={{ marginBottom: 4 }}
                onCancel={handleStop}
              />

              {builderResult && <ResultBanner result={builderResult} style={{ marginTop: 16 }} />}
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

                {boardId ? (
                  <View style={s.boardIdRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.boardIdLabel}>Board ID</Text>
                      <Text style={s.boardIdValue} numberOfLines={1}>{boardId}</Text>
                    </View>
                    <TouchableOpacity onPress={handleFindBoard} style={s.refreshBtn}>
                      <RefreshCw size={14} color="#666" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <Text style={[s.cardBody, { marginTop: 6 }]}>
                      Auto-detect your active board from the first workspace.
                    </Text>
                    <ActionBtn
                      onPress={handleFindBoard}
                      disabled={branchLoading === 'find'}
                      loading={branchLoading === 'find'}
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
              {BRANCH_ACTIONS.map(action => {
                const Icon = action.icon;
                const isActive = branchLoading === action.id;
                const disabled = !boardId || !!branchLoading;
                return (
                  <Pressable
                    key={action.id}
                    onPress={() => !isActive && handleBranchAction(action.id)}
                    disabled={disabled && !isActive}
                    style={[s.branchCard, { opacity: disabled && !isActive ? 0.42 : 1 }]}
                  >
                    <View style={[s.iconBubble, { backgroundColor: `${action.color}18`, marginRight: 14 }]}>
                      {isActive
                        ? <ActivityIndicator size="small" color={action.color} />
                        : <Icon size={18} color={action.color} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.branchCardTitle}>{action.title}</Text>
                      <Text style={s.branchCardDesc}>
                        {isActive ? 'Running…' : action.desc}
                      </Text>
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

              {branchResult && <ResultBanner result={branchResult} style={{ marginTop: 8 }} />}

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

// ─── Shared components ────────────────────────────────

function ActionBtn({ onPress, disabled, loading, label, loadingLabel, color, style, onCancel }) {
  return (
    <View style={[loading && onCancel ? s.actionBtnRow : null, style]}>
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={[
          s.actionBtn,
          { backgroundColor: color, opacity: disabled ? 0.42 : 1 },
          loading && onCancel ? { flex: 1 } : null,
        ]}
      >
        {loading ? (
          <>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={[s.actionBtnText, { marginLeft: 9 }]}>{loadingLabel}</Text>
          </>
        ) : (
          <Text style={s.actionBtnText}>{label}</Text>
        )}
      </TouchableOpacity>

      {loading && onCancel && (
        <TouchableOpacity onPress={onCancel} style={s.cancelBtn}>
          <X size={15} color="#EB5A46" />
          <Text style={s.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function ResultBanner({ result, style }) {
  const ok = result?.success;
  return (
    <View style={[s.resultBanner, ok ? s.resultBannerOk : s.resultBannerErr, style]}>
      {ok
        ? <CheckCircle size={17} color="#4ade80" style={{ marginRight: 10, marginTop: 1 }} />
        : <XCircle size={17} color="#EB5A46" style={{ marginRight: 10, marginTop: 1 }} />}
      <View style={{ flex: 1 }}>
        <Text style={[s.resultTitle, { color: ok ? '#4ade80' : '#EB5A46' }]}>
          {ok ? 'Success' : 'Error'}
        </Text>
        <Text style={s.resultMessage}>
          {ok
            ? (result.message || result.board?.name || result.boardUrl || 'Done')
            : (result.error || 'Something went wrong')}
        </Text>
      </View>
    </View>
  );
}

// ─── Live Timeline ────────────────────────────────────

const TYPE_CFG = {
  info:    { color: '#0079BF', prefix: '›' },
  warn:    { color: '#F2D600', prefix: '⚠' },
  error:   { color: '#EB5A46', prefix: '✗' },
  success: { color: '#4ade80', prefix: '✓' },
};

function LiveTimeline({ logs, isRunning, elapsed, pulseAnim, progressAnim, scrollRef, operationLabel, screenW }) {
  const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <View style={ts.container}>

      {/* Animated shimmer progress bar */}
      <View style={ts.progressTrack}>
        <Animated.View style={[ts.progressShimmer, {
          transform: [{
            translateX: progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-(screenW * 0.5), screenW],
            }),
          }],
        }]}>
          <LinearGradient
            colors={['transparent', 'rgba(0,121,191,0.9)', 'rgba(0,161,239,1)', 'rgba(0,121,191,0.9)', 'transparent']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={{ width: screenW * 0.4, height: 2 }}
          />
        </Animated.View>
      </View>

      {/* Header */}
      <View style={ts.header}>
        <View style={ts.headerLeft}>
          <Animated.View style={[ts.liveDot, { opacity: pulseAnim }]} />
          <Text style={ts.opLabel}>{operationLabel}</Text>
          {isRunning && (
            <View style={ts.runningPill}>
              <Text style={ts.runningPillText}>LIVE</Text>
            </View>
          )}
        </View>
        <Text style={ts.elapsed}>{fmt(elapsed)}</Text>
      </View>

      {/* Entries */}
      <ScrollView
        ref={scrollRef}
        style={ts.logList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 12 }}
      >
        {logs.map((log, i) => (
          <TimelineEntry
            key={log.id}
            log={log}
            isLast={i === logs.length - 1}
            cfg={TYPE_CFG[log.type] || TYPE_CFG.info}
          />
        ))}
        {isRunning && <ThinkingDots />}
      </ScrollView>
    </View>
  );
}

function TimelineEntry({ log, isLast, cfg }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1, tension: 230, friction: 24, useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[ts.entry, {
      opacity: anim,
      transform: [{ translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [-18, 0] }) }],
    }]}>
      <View style={[ts.entryBar, { backgroundColor: cfg.color, opacity: isLast ? 1 : 0.3 }]} />
      <Text style={ts.entryTime}>{log.time}</Text>
      <Text style={[ts.entryPrefix, { color: cfg.color, opacity: isLast ? 1 : 0.55 }]}>{cfg.prefix}</Text>
      <Text style={[ts.entryMsg, { color: isLast ? cfg.color : '#4a5568' }]} numberOfLines={isLast ? 4 : 2}>
        {log.message}
      </Text>
    </Animated.View>
  );
}

function ThinkingDots() {
  const a1 = useRef(new Animated.Value(0.25)).current;
  const a2 = useRef(new Animated.Value(0.25)).current;
  const a3 = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    const makeLoop = anim =>
      Animated.loop(Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.25, duration: 380, useNativeDriver: true }),
      ]));
    const l1 = makeLoop(a1); const l2 = makeLoop(a2); const l3 = makeLoop(a3);
    l1.start();
    const t2 = setTimeout(() => l2.start(), 190);
    const t3 = setTimeout(() => l3.start(), 380);
    return () => { l1.stop(); l2.stop(); l3.stop(); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <View style={ts.dotsRow}>
      {[a1, a2, a3].map((a, i) => (
        <Animated.View key={i} style={[ts.dot, { opacity: a }]} />
      ))}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────

const s = {
  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#242424',
  },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  headerSub: { color: '#555', fontSize: 12, marginTop: 1 },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#242424', borderWidth: 1, borderColor: '#2e2e2e',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  stopBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(235,90,70,0.10)',
    borderWidth: 1, borderColor: 'rgba(235,90,70,0.32)',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7,
  },
  stopBtnText: { color: '#EB5A46', fontSize: 13, fontWeight: '700', marginLeft: 6 },

  // Tab bar
  tabBar: {
    flexDirection: 'row', marginHorizontal: 20, marginTop: 16, marginBottom: 4,
    padding: 4, backgroundColor: '#242424', borderRadius: 14,
    borderWidth: 1, borderColor: '#2e2e2e',
  },
  tabItem: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  tabItemActive: { backgroundColor: '#0079BF' },
  tabLabel: { fontSize: 13, fontWeight: '600', color: '#666' },
  tabLabelActive: { color: '#fff' },

  // Tab content
  tabContent: { paddingHorizontal: 20, paddingTop: 20 },
  sectionLabel: {
    color: '#555', fontSize: 11, fontWeight: '700',
    letterSpacing: 1.3, textTransform: 'uppercase', marginBottom: 12,
  },

  // Card
  card: {
    backgroundColor: '#242424', borderRadius: 16,
    borderWidth: 1, borderColor: '#2e2e2e',
    padding: 16, marginBottom: 16,
  },
  cardTitle: { color: '#fff', fontSize: 14, fontWeight: '600' },
  cardBody: { color: '#666', fontSize: 13, lineHeight: 18, marginTop: 6, marginBottom: 14 },

  // Instructions
  instructionBody: {
    marginTop: 14, paddingTop: 14,
    borderTopWidth: 1, borderTopColor: '#2e2e2e',
  },
  instructionItem: { color: '#a1a1aa', fontSize: 13, flex: 1, lineHeight: 19 },

  // AI Prompt button
  promptBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,121,191,0.10)',
    borderWidth: 1, borderColor: 'rgba(0,121,191,0.28)',
    borderRadius: 12, paddingVertical: 13,
  },
  promptBtnText: { color: '#0079BF', fontWeight: '600', fontSize: 14, marginLeft: 8 },

  // Markdown input card
  inputCard: {
    backgroundColor: '#242424', borderRadius: 16,
    borderWidth: 1, borderColor: '#2e2e2e',
    marginBottom: 16, overflow: 'hidden',
  },
  inputToolbar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#2e2e2e',
  },
  toolbarBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#2e2e2e', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  toolbarBtnText: { color: '#a1a1aa', fontSize: 12, marginLeft: 5 },
  toolbarBtnDanger: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(235,90,70,0.10)', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  toolbarBtnDangerText: { color: '#EB5A46', fontSize: 12, marginLeft: 5 },
  textArea: {
    color: '#a1a1aa', padding: 14,
    minHeight: 190, textAlignVertical: 'top', fontSize: 13,
  },
  charCount: {
    color: '#333', fontSize: 11, textAlign: 'right',
    paddingHorizontal: 14, paddingBottom: 10,
  },

  // Input mode mini-tabs
  miniTabBar: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 8, padding: 2,
    borderWidth: 1, borderColor: '#2e2e2e',
  },
  miniTab: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6,
  },
  miniTabActive: { backgroundColor: '#0079BF' },
  miniTabText: { color: '#666', fontSize: 12, fontWeight: '600', marginLeft: 4 },
  miniTabTextActive: { color: '#fff' },

  // Paste mode toolbar (shown above textarea)
  pasteToolbar: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 14, paddingTop: 12, paddingBottom: 4,
  },

  // Upload mode
  uploadArea: { padding: 14 },
  dropZone: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 40,
    borderWidth: 1, borderStyle: 'dashed', borderColor: '#2e2e2e',
    borderRadius: 12,
  },
  uploadIconRing: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#1a1a1a',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },
  dropZoneTitle: {
    color: '#a1a1aa', fontSize: 14, fontWeight: '600', marginBottom: 6,
  },
  dropZoneSubtitle: {
    color: '#555', fontSize: 12, letterSpacing: 0.6,
  },
  fileLoadedCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(74,222,128,0.06)',
    borderWidth: 1, borderColor: 'rgba(74,222,128,0.2)',
    borderRadius: 12, padding: 14, marginBottom: 10,
  },
  fileIcon: {
    width: 42, height: 42, borderRadius: 10,
    backgroundColor: 'rgba(0,121,191,0.10)',
    alignItems: 'center', justifyContent: 'center',
  },
  fileName: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 2 },
  fileMeta: { color: '#4ade80', fontSize: 12 },
  fileClearBtn: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: '#2e2e2e',
    alignItems: 'center', justifyContent: 'center',
  },
  rePickBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10,
    borderWidth: 1, borderColor: 'rgba(0,121,191,0.25)',
    borderRadius: 10, backgroundColor: 'rgba(0,121,191,0.07)',
  },
  rePickBtnText: { color: '#0079BF', fontSize: 13, fontWeight: '600', marginLeft: 6 },

  // Action button
  actionBtnRow: {
    flexDirection: 'row', gap: 10,
  },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 14, paddingVertical: 16,
  },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  cancelBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(235,90,70,0.10)',
    borderWidth: 1, borderColor: 'rgba(235,90,70,0.30)',
    borderRadius: 14, paddingHorizontal: 18, paddingVertical: 16,
  },
  cancelBtnText: {
    color: '#EB5A46', fontWeight: '700', fontSize: 14, marginLeft: 6,
  },
  inlineCancelBtn: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: 'rgba(235,90,70,0.10)',
    borderWidth: 1, borderColor: 'rgba(235,90,70,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Icon bubble
  iconBubble: {
    width: 42, height: 42, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },

  // Branch card
  branchCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#242424', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#2e2e2e', marginBottom: 10,
  },
  branchCardTitle: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 2 },
  branchCardDesc: { color: '#666', fontSize: 12, lineHeight: 17 },

  // Board ID row
  boardIdRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1a1a1a', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: '#2e2e2e', marginTop: 10,
  },
  boardIdLabel: { color: '#555', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 3 },
  boardIdValue: { color: '#a1a1aa', fontSize: 12 },
  refreshBtn: { padding: 6, borderRadius: 8, backgroundColor: '#2e2e2e', marginLeft: 8 },

  // Result banner
  resultBanner: {
    borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'flex-start',
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

// ─── Timeline styles ──────────────────────────────────

const ts = {
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
