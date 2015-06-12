/** @jsx React.DOM */

'use strict';

var React = require('React'),
	moment = require('moment'),
	_ = require('lodash'),
	$ = require('jquery');

var css = require('../sass/list.scss');

function articleMapper (article, index) {
	var authorName = [article.profile.first_name, article.profile.last_name].join(' '),
		timeStr = moment(article.publish_at, 'YYYY-MM-DD hh:mm:ss').fromNow();

	return (
		<article>
			<div className="mic-article-title-col">
				<h3>
					<img className="mic-article-thumbnail" src={article.image} />
					{article.title}
				</h3>
			</div>

			<div className="mic-article-author-col">{authorName}</div>
			<div className="mic-article-words-col">{article.words}</div>
			<div className="mic-article-submitted-col">{timeStr}</div>
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
				<div className="mic-header-row">
					<div className="mic-article-title-col">Unpublished Articles</div>
					<div className="mic-article-author-col">Author</div>
					<div className="mic-article-words-col">Words</div>
					<div className="mic-article-submitted-col">Submitted</div>
				</div>

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

		// If we've reached the end of the articles list and we haven't loaded more yet
		if (state.stop >= state.articles.length && state.moreArticlesLoaded !== true) {

			this.fetchArticles('data/more-articles.json');
			return;
		}

		this.setState({
			stop: newStop,
			// Show the load more button until we've loaded the more articles data and we've reached the end of them
			showLoadMore: !(state.moreArticlesLoaded && newStop >= state.articles.length)
		});
	},

	componentDidMount: function() {
		$('.mic-load-more-articles').on('click', this.loadMoreArticles);

		this.fetchArticles('data/articles.json');
	}
});