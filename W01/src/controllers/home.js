const showHomePage = (req, res) => {
  res.render('index', { title: 'ServiceConnect | Home' });
};

export { showHomePage };
