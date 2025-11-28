# Design Guidelines: E2EE Social & Organization Hub App

## Architecture Decisions

### Authentication
**Auth Required** - Multi-user social app with encrypted messaging and organization features.

**Implementation:**
- Biometric authentication (Face ID/Touch ID) as primary login method
- SSO fallback: Apple Sign-In (iOS required) + Google Sign-In
- Initial setup flow: SSO → Biometric enrollment → Profile creation
- Auth state persists locally with encrypted credentials
- Login screen: Minimalist with biometric prompt, "Use Email" fallback link
- Include Privacy Policy & Terms of Service links
- Account screen includes: Log out (with confirmation), Delete account (nested under Settings > Account > Delete with double confirmation and data retention warning)

### Navigation Architecture
**Tab Navigation** (5 tabs with center floating action button for core "Create Post" action):

1. **Feed Tab** - City-based activity feed
2. **Messages Tab** - Direct & group conversations
3. **Create (FAB)** - Floating action button for new post
4. **Organizations Tab** - Organization discovery & management
5. **Profile Tab** - User profile, QR sharing, settings

**Stack Structure:**
- Each tab maintains its own navigation stack
- Modals: QR Scanner, Post Creation, Organization Creation, Comment Threads, Settings

### Screen Specifications

#### 1. City Feed Screen (Home)
**Purpose:** Browse and interact with local user activity

**Layout:**
- Header: Custom transparent header
  - Left: City selector dropdown (e.g., "San Francisco ▼")
  - Right: Search icon button
  - No header title, transparent background
- Content: Scrollable FlatList of feed cards
  - Pull-to-refresh functionality
  - Each card shows: author avatar, name, timestamp, content, image (if any), engagement (likes, comments)
  - Tap card → opens detailed post view with comments
- Floating: Create FAB (center tab)
- Safe area: top: headerHeight + Spacing.xl, bottom: tabBarHeight + Spacing.xl

**Components:** FeedCard, CitySelector, SearchBar (modal), PostDetail (modal)

#### 2. Post Detail Screen (Modal)
**Purpose:** View post with threaded comments

**Layout:**
- Header: Default navigation header
  - Left: Close button
  - Title: "Post"
  - Right: Share icon
- Content: ScrollView
  - Post content (full size)
  - Comment input bar (pinned above keyboard)
  - Threaded comment list (nested indentation for replies)
- Safe area: top: Spacing.xl, bottom: insets.bottom + Spacing.xl

#### 3. Messages Screen
**Purpose:** View all conversations (DMs & group chats)

**Layout:**
- Header: Default opaque header
  - Title: "Messages"
  - Right: New message icon
- Content: Searchable list of conversation previews
  - Each row: Avatar/group icon, name, last message preview, timestamp, unread badge
  - Swipe actions: Pin, Mute, Delete
- Safe area: top: Spacing.xl, bottom: tabBarHeight + Spacing.xl

#### 4. Conversation Screen
**Purpose:** 1:1 or group encrypted messaging

**Layout:**
- Header: Custom header
  - Left: Back button
  - Center: Avatar + Name (tap for details)
  - Right: Video/call icon (future), More menu
- Content: Inverted FlatList (messages bottom-up)
  - Message bubbles: sender on right (primary color), receiver on left (light gray)
  - Typing indicator
  - E2EE badge in header (small lock icon)
- Input: Fixed bottom message bar with text input, attach button, send button
- Safe area: top: Spacing.xl, bottom: insets.bottom + Spacing.xl

#### 5. Organizations Screen
**Purpose:** Browse and manage organization memberships

**Layout:**
- Header: Default header
  - Title: "Organizations"
  - Right: Create organization icon
- Content: Segmented control tabs
  - "My Orgs" - Organizations user owns/is member of (scrollable grid/list)
  - "Discover" - Browse public organizations in city (searchable list)
- Safe area: top: Spacing.xl, bottom: tabBarHeight + Spacing.xl

#### 6. Organization Hub Screen
**Purpose:** View organization profile, feed, and members

**Layout:**
- Header: Custom transparent header with large org avatar/logo
  - Parallax scroll effect
  - Left: Back button
  - Right: More menu (join/leave, settings if owner)
- Content: ScrollView with nested tabs
  - Organization header: Name, description, member count
  - Tab selector: Feed | Members | About
  - Feed tab: Dual-post buttons (Post to City | Post to Org)
  - Members tab: List with roles (Owner, Member), invite button for owners
- Safe area: top: headerHeight + Spacing.xl, bottom: tabBarHeight + Spacing.xl

#### 7. Profile Screen
**Purpose:** User profile, QR sharing, settings

**Layout:**
- Header: Default header
  - Title: User's display name
  - Right: Settings icon
- Content: ScrollView
  - Profile section: Large avatar, bio, comrade count
  - QR Code card: "Share My QR" button → expands QR code
  - QR Scanner button: "Add Comrade" → opens camera scanner
  - Activity section: User's posts grid
  - Settings nested under Settings icon
- Safe area: top: Spacing.xl, bottom: tabBarHeight + Spacing.xl

#### 8. QR Code Scanner Screen (Modal)
**Purpose:** Scan comrade QR codes to add connections

**Layout:**
- Full-screen camera view
- Header overlay: Semi-transparent
  - Left: Close button
  - Title: "Scan QR Code"
- Center: Scanning frame overlay
- Bottom overlay: "Point camera at QR code" helper text
- Success state: Shows scanned comrade preview with "Add Comrade" button

## Design System

### Color Palette
- **Background:** #fffff0 (cream, primary app background)
- **Primary:** #8B7355 (earthy brown, derived from logo aesthetic)
- **Secondary:** #D4A373 (warm tan, accents)
- **Surface:** #ffffff (white cards, elevated surfaces)
- **Text Primary:** #2C2416 (dark brown, high contrast on cream)
- **Text Secondary:** #6B5D4F (medium brown, secondary text)
- **Border:** #E5DDD3 (subtle cream border)
- **Success:** #6B8E23 (olive green for E2EE indicators)
- **Error:** #C1440E (warm red)
- **System Gray:** #F5F5F0 (lighter cream for disabled states)

### Typography
- **Headings:** SF Pro Display (iOS) / Roboto (Android) - Bold
  - H1: 28pt, Bold
  - H2: 22pt, Semibold
  - H3: 18pt, Semibold
- **Body:** SF Pro Text (iOS) / Roboto (Android)
  - Body: 16pt, Regular
  - Caption: 14pt, Regular
  - Small: 12pt, Regular
- **Color:** Text Primary for headings, Text Secondary for body

### Visual Design

**Logo Usage:**
- Custom flower logo appears on splash screen, login screen header
- Favicon-sized version in header of profile screen
- DO NOT use emoji anywhere

**Icons:**
- Use Feather icon set from @expo/vector-icons
- Icon color: Text Primary (#2C2416) or Primary (#8B7355) for active states
- Size: 24px standard, 20px for tab bar

**Cards & Surfaces:**
- Feed cards: White background, 12px border radius, 1px solid Border color
- NO drop shadows on cards
- Subtle pressed state: reduce opacity to 0.8

**Floating Action Button (Create Post):**
- Position: Center of tab bar, elevated above tabs
- Shape: 56x56px circle
- Background: Primary color (#8B7355)
- Icon: Feather "plus" in white
- Drop shadow: EXACT specifications:
  - shadowOffset: {width: 0, height: 2}
  - shadowOpacity: 0.10
  - shadowRadius: 2

**Buttons:**
- Primary: Primary color background, white text, 12px radius
- Secondary: Transparent with Primary border, Primary text
- Pressed state: opacity 0.8 (no shadows)

**Forms:**
- Input fields: White background, 8px radius, 1px Border color
- Focus state: 2px Primary color border
- Submit buttons in header (right side) for modal forms
- Inline submit for message input

**E2EE Indicators:**
- Small lock icon (Feather "lock") in Success color next to conversation titles
- "End-to-end encrypted" badge in conversation headers

**QR Codes:**
- Generate with custom flower logo embedded in center
- Display on white Surface background with 16px padding

**Avatars:**
- Generate 6 preset avatars with abstract flower/nature aesthetic matching logo style
- Circular, 40px for lists, 80px for profiles, 120px for org hubs
- Default state: Initials on Primary background

**Accessibility:**
- Minimum touch targets: 44x44px
- Color contrast: WCAG AA compliant (4.5:1 for body text on cream)
- VoiceOver labels for all interactive elements
- Support dynamic type scaling