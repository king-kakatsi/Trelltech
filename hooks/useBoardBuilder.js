import { useState, useCallback } from 'react';
import { Alert, Clipboard } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { createBoardFromMarkdown } from '../utils/boardFromMarkdown';
import { TRELLO_PLANNING_PROMPT } from '../utils/getPlanningPrompt';

/**
 * Hook for the Board Builder tab: markdown input (paste/upload) and board creation.
 */
export default function useBoardBuilder({ addLog, runWithLogs, abortedRef }) {
  const [loading, setLoading] = useState(false);
  const [markdownContent, setMarkdownContent] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);
  const [builderResult, setBuilderResult] = useState(null);
  const [inputMode, setInputMode] = useState('paste'); // 'paste' | 'upload'
  const [uploadedFile, setUploadedFile] = useState(null); // { name, size }
  const [pickLoading, setPickLoading] = useState(false);

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
  }, [markdownContent, addLog, runWithLogs, abortedRef]);

  const clearLoading = useCallback(() => {
    setLoading(false);
  }, []);

  return {
    loading,
    markdownContent,
    setMarkdownContent,
    showInstructions,
    setShowInstructions,
    builderResult,
    inputMode,
    setInputMode,
    uploadedFile,
    pickLoading,
    handleCopyPrompt,
    handlePaste,
    handlePickFile,
    handleClearContent,
    handleCreateBoard,
    clearLoading,
  };
}
