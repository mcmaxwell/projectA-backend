const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const LocalStrategy = require('passport-local').Strategy
const User = require('./models/User')

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ googleId: profile.id })

                if (!user) {
                    user = await User.create({
                        googleId: profile.id,
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        avatar: profile.photos[0].value,
                        userType: 'serviceProvider', // or 'jobPoster' based on your logic
                    })
                }

                done(null, user)
            } catch (error) {
                done(error, false)
            }
        }
    )
)

passport.use(
    new LocalStrategy(
        { usernameField: 'email' },
        async (email, password, done) => {
            try {
                const user = await User.findOne({ email })

                if (!user) {
                    return done(null, false, {
                        message: 'Invalid email or password',
                    })
                }

                const isMatch = await user.matchPassword(password)

                if (!isMatch) {
                    return done(null, false, {
                        message: 'Invalid email or password',
                    })
                }

                done(null, user)
            } catch (error) {
                done(error, false)
            }
        }
    )
)

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id)
        done(null, user)
    } catch (error) {
        done(error, false)
    }
})
