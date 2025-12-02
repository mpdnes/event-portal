# Pet Gamification System

## Overview
A virtual pet companion system that grows and levels up as users attend and complete professional development (PD) sessions. This system gamifies staff engagement with PD programming and provides visual feedback for user participation.

## Core Concept
- Each user has a unique pet companion
- Pets gain experience (XP) when users register for and attend PD sessions
- Pets level up as they accumulate XP, unlocking new appearances and cosmetics
- Pet status is displayed on dashboards and throughout the application
- System encourages repeat attendance and engagement with PD offerings

## Phase 1: MVP (1 Week)

### Features
- **Pet Creation**: Users automatically get a pet when they first log in
- **Basic Pet Display**: Simple CSS-based or emoji-based pet avatar
- **XP System**: 
  - Users earn XP when they register for a PD session
  - Different session types award different XP amounts (e.g., workshop = 50 XP, social = 25 XP)
  - XP bar shows progress to next level
- **Leveling System**:
  - Every 100 XP = 1 level
  - Visual feedback when leveling up (animation, toast notification)
  - Display current level and total XP
- **Pet Stats Display**:
  - Current Level
  - Total XP / XP to next level
  - Pet name (customizable by user)

### Database Changes
```sql
CREATE TABLE user_pets (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(100) NOT NULL,
  pet_type VARCHAR(50) DEFAULT 'cat',
  level INT DEFAULT 1,
  experience INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE pet_experience_log (
  id UUID PRIMARY KEY,
  user_pet_id UUID NOT NULL REFERENCES user_pets(id),
  session_id UUID REFERENCES sessions(id),
  experience_gained INT NOT NULL,
  reason VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Backend Implementation
- **Endpoints**:
  - `GET /pets/my-pet` - Retrieve current user's pet
  - `POST /pets/create` - Create pet on first login
  - `PUT /pets/:id/name` - Update pet name
  - `GET /pets/leaderboard` - Top pets by level

- **Logic**:
  - Award XP when session registration created
  - Calculate level based on total XP
  - Track XP gains in experience log for analytics

### Frontend Implementation
- **Pet Display Component** (`PetCompanion.tsx`):
  - Small pet avatar (CSS-based or emoji)
  - Current level and XP bar
  - Pet name
  - Show on Dashboard, Calendar, Navbar

- **Styling Approach**:
  - Option 1: CSS shapes (circles, simple forms)
  - Option 2: Emoji with CSS animations
  - Option 3: Simple SVG
  - Animated level-up celebration (bounce, glow effect)

- **Placement**:
  - Top of Staff Dashboard
  - Sidebar on Calendar page
  - Navigation bar (small icon form)
  - My Registrations page

## Phase 2: Enhanced Features (2-3 Weeks)

### Features
- **Pet Customization**:
  - Pet type selection (cat, dog, rabbit, fox, etc.)
  - Color customization
  - Accessory unlocking (hats, glasses, scarves)
  - Save customization preferences

- **Interaction System**:
  - Pet interaction buttons (pet, feed, play)
  - Bonus XP for daily interactions
  - Pet "moods" based on interaction frequency
  - Simple idle animations (blinking, tail wag)

- **Achievement System**:
  - Achievement badges for milestones:
    - First PD attended
    - Level 5 reached
    - 5 sessions in a week
    - 10 sessions total
    - Perfect attendance (all offered sessions in month)
  - Display achievements on profile
  - Achievement notifications

- **Cosmetics Shop**:
  - Earn cosmetic points from session attendance
  - Purchase pet accessories, colors, types
  - Limited-time cosmetics for seasonal events

- **Leaderboard**:
  - Top 10 pets by level
  - Top 10 pets by XP gained this month
  - Department/team leaderboards
  - Display on dedicated page

- **Session Completion Tracking**:
  - Mark sessions as "attended" (admin or auto-tracking)
  - Bonus XP for attending (vs just registering)
  - Streak tracking (consecutive week attendance)

## Phase 3: Advanced Features (Future)

- **Pet Evolution**: Pets evolve into different forms at certain levels
- **Pet Breeding/Trading**: Advanced social features
- **Pet Skill Tree**: Users unlock abilities for their pets
- **Seasonal Events**: Special cosmetics and challenges
- **Mobile App Integration**: Push notifications for pet milestones
- **Analytics Dashboard**: Admin view of pet system engagement metrics

## Technical Implementation Notes

### Stack
- **Frontend**: React + TypeScript, TailwindCSS for styling, CSS animations
- **Backend**: Express.js, PostgreSQL
- **Icons**: Heroicons (where applicable)

### Asset Strategy
**Phase 1 (MVP)**: CSS-based pet or emoji + animations
- No external asset dependencies
- Fully customizable via CSS variables
- Can add simple SVG if needed
- Example: Colorful circle body, simple face shapes

**Future Phases**: 
- Commission custom sprite sheets once ROI is proven
- Or use free sprite packs from itch.io/OpenGameArt
- Consider procedurally generated pets based on user preferences

### Data Model
```typescript
interface UserPet {
  id: string;
  userId: string;
  name: string;
  petType: 'cat' | 'dog' | 'rabbit' | 'fox' | 'custom';
  level: number;
  experience: number;
  color: string;
  accessories: string[];
  mood?: 'happy' | 'neutral' | 'sleepy';
  createdAt: Date;
  updatedAt: Date;
}

interface PetExperienceLog {
  id: string;
  userPetId: string;
  sessionId?: string;
  experienceGained: number;
  reason: 'registration' | 'attendance' | 'interaction' | 'achievement';
  createdAt: Date;
}
```

## Success Metrics
- Track increase in session registration rates
- Monitor pet level distribution across users
- Measure repeat attendance patterns
- Calculate engagement time spent viewing pet
- Survey user satisfaction with gamification

## Timeline Estimate
- **MVP (Phase 1)**: 5-7 days
- **Phase 2**: 2-3 weeks additional
- **Phase 3**: Ongoing seasonal updates

## Notes
- Pet system should be optional/toggleable in settings to respect user preferences
- Avoid dark patterns - XP gains should feel natural from normal PD engagement
- Consider accessibility - ensure pet visuals don't rely solely on color
- Plan for analytics to measure impact on PD attendance and engagement
