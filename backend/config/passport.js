import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.js';

const configurePassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
        proxy: true,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists with this Google ID
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            return done(null, user);
          }

          // Check if user exists with the same email (registered via local)
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // Link Google account to existing local account
            user.googleId = profile.id;
            user.avatar = profile.photos?.[0]?.value || user.avatar;
            if (user.authProvider === 'local') {
              user.authProvider = 'local'; // keep as local since they registered locally first
            }
            await user.save();
            return done(null, user);
          }

          // Create a new user from Google profile
          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            avatar: profile.photos?.[0]?.value || '',
            authProvider: 'google',
          });

          return done(null, user);
        } catch (error) {
          console.error('Google OAuth Error:', error);
          return done(error, null);
        }
      }
    )
  );

  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL || '/api/auth/github/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists with this GitHub ID
          let user = await User.findOne({ githubId: profile.id });
          if (user) {
            return done(null, user);
          }

          // Try to get a primary email from GitHub profile
          const githubEmail = profile.emails?.[0]?.value;

          // If an existing account has this email, link GitHub
          if (githubEmail) {
            user = await User.findOne({ email: githubEmail });
            if (user) {
              user.githubId = profile.id;
              user.avatar = profile.photos?.[0]?.value || user.avatar;
              await user.save();
              return done(null, user);
            }
          }

          // Create a new user from GitHub profile
          user = await User.create({
            name: profile.displayName || profile.username || 'GitHub User',
            email: githubEmail || `${profile.username}@users.noreply.github.com`,
            githubId: profile.id,
            avatar: profile.photos?.[0]?.value || '',
            authProvider: 'github',
          });

          return done(null, user);
        } catch (error) {
          console.error('GitHub OAuth Error:', error);
          return done(error, null);
        }
      }
    )
  );

  // Serialize / Deserialize (needed even if we use JWT, for the OAuth flow)
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};

export default configurePassport;
