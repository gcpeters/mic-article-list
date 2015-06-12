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
			start = 10;;

		if (_.isArray(state.articles)) {

			start += state.articles.length;
			articles = state.articles.concat(articles);
		}

		this.setState({
			start: 0,
			stop: start,
			articles: articles
		});
	},

	render: function () {
		var state = this.state,
			articles = state.articles.slice(state.start, state.stop),
			articleNodes = _.map(articles, articleMapper);

		return (
			<div className="mic-article-list">
				{articleNodes}
				<a href="#" className="mic-load-more-articles">Load More Articles</a>
			</div>
		);
	},

	getInitialState: function() {
		return {
			start: 0,
			stop: 0,
			articles: []
		};
	},

	loadMoreArticles: function (evt) {
		var state = this.state;

		this.setState({
			stop: this.state.stop + 10
		});

		evt.preventDefault();
	},

	componentDidMount: function() {
		$('.mic-load-more-articles').on('click', this.loadMoreArticles);

		this.fetchArticles('data/articles.json');
	}
});