/**
 * Styles for the create-board automation screen.
 */
const styles = {
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

  // Inline cancel button inside branch action rows
  inlineCancelBtn: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: 'rgba(235,90,70,0.10)',
    borderWidth: 1, borderColor: 'rgba(235,90,70,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
};

export default styles;
