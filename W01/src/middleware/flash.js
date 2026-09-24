// Flash messages: a message stored on the session by one request and read by
// the next one, which is what makes the "save, redirect, then show the result"
// pattern possible. Reading a message also clears it, so it appears only once.

const EMPTY_MESSAGES = () => ({ success: [], error: [], warning: [], info: [] });

const flash = (req, res, next) => {
  if (!req.session.flash) {
    req.session.flash = EMPTY_MESSAGES();
  }

  req.flash = (type, message) => {
    // req.flash('success', 'Saved!') stores a message
    if (type && message) {
      if (!req.session.flash[type]) {
        req.session.flash[type] = [];
      }
      req.session.flash[type].push(message);
      return;
    }

    // req.flash('success') reads and clears one type
    if (type) {
      const messages = req.session.flash[type] || [];
      req.session.flash[type] = [];
      return messages;
    }

    // req.flash() reads and clears everything
    const all = req.session.flash;
    req.session.flash = EMPTY_MESSAGES();
    return all;
  };

  // the views call flash() to print whatever is waiting
  res.locals.flash = req.flash;
  next();
};

export default flash;
