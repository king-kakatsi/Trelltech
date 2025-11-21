/**
 * Integration tests for OAuth Authentication System
 * 
 * Purpose: Verify that users can authenticate with Trello, store tokens securely,
 * and access their account information reliably.
 * 
 * What we test:
 * - OAuth login flow
 * - Token storage and retrieval
 * - User profile fetching
 * - Complete authentication workflows
 */

// Mock AsyncStorage to simulate local device storage without requiring a real device
const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock Expo WebBrowser to simulate OAuth redirect without opening a real browser
const mockOpenAuthSessionAsync = jest.fn();
jest.mock('expo-web-browser', () => ({
  openAuthSessionAsync: mockOpenAuthSessionAsync,
  maybeCompleteAuthSession: jest.fn(),
}));

// Mock Expo AuthSession to simulate redirect URL generation
jest.mock('expo-auth-session', () => ({
  makeRedirectUri: jest.fn(() => 'exp://localhost:8081/--/auth'),
}));

// Mock Expo Linking
jest.mock('expo-linking', () => ({
  createURL: jest.fn(() => 'exp://localhost:8081'),
}));

// Mock axios service to simulate API calls without hitting real endpoints
const mockGetFromApi = jest.fn();
const mockUpdateWithApi = jest.fn();

jest.mock('../services/axiosService', () => ({
  getFromApi: (...args) => mockGetFromApi(...args),
  updateWithApi: (...args) => mockUpdateWithApi(...args),
}));

// Import services after all mocks are set up
const trelloService = require('../services/trello');
const localStorageService = require('../services/localStorageService');

describe('OAuth Authentication System - Integration Tests', () => {
  // Test data that simulates real authentication responses
  const MOCK_TOKEN = 'test_token_abc123xyz';
  const MOCK_USER = {
    id: 'user-123',
    fullName: 'John Doe',
    username: 'johndoe',
    email: 'john@example.com',
  };

  beforeEach(() => {
    // Reset all mock functions before each test to ensure clean state
    jest.clearAllMocks();
    
    // Set default mock behavior for AsyncStorage
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(true);
    mockAsyncStorage.removeItem.mockResolvedValue(true);
  });

  describe('OAuth Flow', () => {
    /**
     * Test successful authentication
     * 
     * Scenario: User opens OAuth login, approves access, and gets redirected back with token
     */
    it('should authenticate user and return token', async () => {
      // Simulate successful OAuth redirect with token in URL
      const redirectUrl = `exp://localhost:8081/--/auth#token=${MOCK_TOKEN}`;
      mockOpenAuthSessionAsync.mockResolvedValue({
        type: 'success',
        url: redirectUrl,
      });

      // Call authentication service
      const token = await trelloService.authenticate();

      // Verify OAuth browser was opened
      expect(mockOpenAuthSessionAsync).toHaveBeenCalledTimes(1);
      
      // Verify token was extracted correctly from redirect URL
      expect(token).toBe(MOCK_TOKEN);
    });

    /**
     * Test user cancellation
     * 
     * Scenario: User clicks "Cancel" in OAuth browser window
     */
    it('should handle user cancellation', async () => {
      mockOpenAuthSessionAsync.mockResolvedValue({
        type: 'cancel',
      });

      // Authentication should throw error when user cancels
      await expect(trelloService.authenticate()).rejects.toThrow('Authentication cancelled');
    });

    /**
     * Test missing token scenario
     * 
     * Scenario: OAuth succeeds but redirect URL doesn't contain expected token
     */
    it('should handle missing token in redirect URL', async () => {
      mockOpenAuthSessionAsync.mockResolvedValue({
        type: 'success',
        url: 'exp://localhost:8081/--/auth', // No token in URL
      });

      await expect(trelloService.authenticate()).rejects.toThrow('Token not found in redirect URL');
    });
  });

  describe('Token Storage', () => {
    /**
     * Test saving token to device
     * 
     * Purpose: Tokens must be stored securely so users don't have to login every time
     */
    it('should save token to AsyncStorage', async () => {
      await localStorageService.saveInLocalStorage('trello_token', MOCK_TOKEN);

      // Verify AsyncStorage.setItem was called with correct parameters
      expect(mockAsyncStorage.setItem).toHaveBeenCalledTimes(1);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'trello_token',
        JSON.stringify(MOCK_TOKEN) // Token is stored as JSON string
      );
    });

    /**
     * Test retrieving saved token
     * 
     * Purpose: App needs to check if user has logged in before
     */
    it('should retrieve token from AsyncStorage', async () => {
      // Simulate token already stored in AsyncStorage
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(MOCK_TOKEN));

      const token = await localStorageService.fetchFromLocalStorage('trello_token');

      // Verify correct key was queried
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('trello_token');
      
      // Verify token was parsed correctly from JSON
      expect(token).toBe(MOCK_TOKEN);
    });

    /**
     * Test logout token removal
     * 
     * Purpose: When user logs out, token must be deleted from device
     */
    it('should remove token from AsyncStorage', async () => {
      await localStorageService.removeFromLocalStorage('trello_token');

      // Verify AsyncStorage.removeItem was called
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledTimes(1);
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('trello_token');
    });
  });

  describe('User Authentication', () => {
    /**
     * Test fetching user profile
     * 
     * Purpose: After authentication, app needs to get user information
     */
    it('should fetch current user with valid token', async () => {
      // Simulate successful API response with user data
      mockGetFromApi.mockResolvedValue([true, MOCK_USER]);

      const user = await trelloService.getCurrentUser(MOCK_TOKEN);

      // Verify API was called once with correct token
      expect(mockGetFromApi).toHaveBeenCalledTimes(1);
      
      // Verify returned user data matches expected structure
      expect(user).toEqual(MOCK_USER);
      expect(user.username).toBe('johndoe');
    });

    /**
     * Test invalid token handling
     * 
     * Purpose: App should handle expired or invalid tokens gracefully
     */
    it('should handle invalid token error', async () => {
      // Simulate API returning unauthorized error
      mockGetFromApi.mockResolvedValue([false, { error: 'Unauthorized' }]);

      await expect(trelloService.getCurrentUser('invalid_token')).rejects.toThrow('Failed to get user');
    });
  });

  describe('Complete Authentication Flows', () => {
    /**
     * Test full login sequence
     * 
     * Purpose: Verify all authentication steps work together correctly
     * Steps: OAuth -> Save token -> Fetch user data
     */
    it('should complete full login flow', async () => {
      // Step 1: User completes OAuth authentication
      const redirectUrl = `exp://localhost:8081/--/auth#token=${MOCK_TOKEN}`;
      mockOpenAuthSessionAsync.mockResolvedValue({
        type: 'success',
        url: redirectUrl,
      });

      const token = await trelloService.authenticate();
      expect(token).toBe(MOCK_TOKEN);

      // Step 2: Token is saved to device storage
      await localStorageService.saveInLocalStorage('trello_token', token);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'trello_token',
        JSON.stringify(MOCK_TOKEN)
      );

      // Step 3: User profile is fetched from API
      mockGetFromApi.mockResolvedValue([true, MOCK_USER]);
      const user = await trelloService.getCurrentUser(token);
      expect(user).toEqual(MOCK_USER);
    });

    /**
     * Test auto-login for returning users
     * 
     * Purpose: Users who previously logged in should be automatically authenticated
     * Steps: Retrieve saved token -> Fetch user data
     */
    it('should complete auto-login for returning user', async () => {
      // Step 1: Check if token exists in storage
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(MOCK_TOKEN));
      const token = await localStorageService.fetchFromLocalStorage('trello_token');
      expect(token).toBe(MOCK_TOKEN);

      // Step 2: Use saved token to fetch user profile
      mockGetFromApi.mockResolvedValue([true, MOCK_USER]);
      const user = await trelloService.getCurrentUser(token);
      expect(user).toEqual(MOCK_USER);
    });

    /**
     * Test logout sequence
     * 
     * Purpose: Verify user can successfully log out and token is removed
     * Steps: Remove token -> Verify token is gone
     */
    it('should complete logout flow', async () => {
      // Remove token from storage
      await localStorageService.removeFromLocalStorage('trello_token');
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('trello_token');

      // Verify token no longer exists
      mockAsyncStorage.getItem.mockResolvedValue(null);
      const token = await localStorageService.fetchFromLocalStorage('trello_token');
      expect(token).toBe(false); // Service returns false when no token found
    });
  });
});