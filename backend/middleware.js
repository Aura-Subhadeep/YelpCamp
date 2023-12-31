const {campgroundSchema, reviewSchema} = require('./schemas')
const ExpressError = require('./utils/ExpressError')
const Campground = require('./models/campground');
const Review = require('./models/review');

// Session return
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

// Logged in validation
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('success', 'Please sign in before proceeding')
        return res.redirect('/login')
    }
    next()
}

// Validate new campground
module.exports.validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

// Author validate
module.exports.isAuthor = async(req, res, next) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    if (!campground.author.equals(req.user._id)) {
        req.flash('success', 'You dont have permission to do that!')
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

// Review author validate
module.exports.isReviewAuthor = async(req, res, next) => {
    const { id, reviewid } = req.params
    const review = await Review.findById(reviewid)
    if (!review.author.equals(req.user._id)) {
        req.flash('success', 'You dont have permission to do that!')
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

// Validate new review
module.exports.validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}