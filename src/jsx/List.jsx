/** @jsx React.DOM */

'use strict';

var React = require('React'),
	moment = require('moment'),
	_ = require('lodash'),
	$ = require('jquery');

function articleMapper (article, index) {

	return (
		<article>
			<div className="mic-article-title-col">
				<span className="mic-article-thumbnail">
					<img src={article.image} />
				</span>

				<h3>{article.title}</h3>
			</div>

			<div className="mic-article-author-col">
				{article.first_name} {article.last_name}
			</div>

			<div className="mic-article-words-col">
				{article.words}
			</div>

			<div className="mic-article-submitted-col">
				{moment(article.publish_at, 'YYYY-MM-DD hh:mm:ss').fromNow()}
			</div>
		</article>
	);
}

module.exports = React.createClass({
	fetchArticles: function (url) {
		$.ajax({
			url: url,
			dataType: 'json',
			cache: false,
			success: this.onArticlesReady,

			error: function(xhr, status, err) {
				console.error && console.error(url, status, err.toString());
			}
		});
	},

	onArticlesReady: function (articles) {
		var state = this.state,
			stop = 10,
			moreArticlesLoaded = false;

		if (state.articles.length > 0) {

			stop += state.articles.length;
			articles = state.articles.concat(articles);
			moreArticlesLoaded = true;
		}

		this.setState({
			stop: stop,
			articles: articles,
			moreArticlesLoaded: moreArticlesLoaded
		});
	},

	render: function () {
		var state = this.state,
			articles = state.articles.slice(state.start, state.stop),
			articleNodes = _.map(articles, articleMapper),
			loadBtn = '';

		if (state.showLoadMore) {

			loadBtn = <a href="#" className="mic-load-more-articles">Load More Articles</a>;
		}

		return (
			<div className="mic-article-list">
				{articleNodes}
				{loadBtn}
			</div>
		);
	},

	getInitialState: function() {
		return {
			start: 0,
			stop: 0,
			showLoadMore: true,
			articles: []
		};
	},

	loadMoreArticles: function (evt) {
		var state = this.state,
			newStop = state.stop + 10,
			isEndOfArticles = state.stop >= state.articles.length;

		evt.preventDefault();

		if (state.stop >= state.articles.length && state.moreArticlesLoaded !== true) {

			this.fetchArticles('data/more-articles.json');
			return;
		}

		this.setState({
			stop: newStop,
			showLoadMore: !(state.moreArticlesLoaded && newStop >= state.articles.length)
		});

		console.log(state.moreArticlesLoaded, newStop >= state.articles.length, state.moreArticlesLoaded && newStop >= state.articles.length);
	},

	componentDidMount: function() {
		$('.mic-load-more-articles').on('click', this.loadMoreArticles);

		this.fetchArticles('data/articles.json');
	}
});