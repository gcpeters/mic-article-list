/** @jsx React.DOM */

'use strict';

var React = require('React'),
	moment = require('moment'),
	css = require('../sass/list.scss'),
	_ = require('lodash'),
	$ = require('jquery');

var DFLT_STOP = 10;

function articleMapper (article, index) {
	var authorName = [article.profile.first_name, article.profile.last_name].join(' '),
		timeStr = moment(article.publish_at, 'YYYY-MM-DD hh:mm:ss').fromNow(),
		className = index % 2 === 0 ? 'mic-odd-row' : 'mic-even-row';

	return (
		<article className={className}>
			<div className="mic-article-title-col">
				<h3>
					<img className="mic-article-thumbnail" src={article.image} />
					<a href={article.url}>{article.title}</a>
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
			articles = _.clone(state.articles).slice(state.start, state.stop),
			loadBtn = '',
			articleNodes;

		if (state.showLoadMore) {

			loadBtn = <a href="#" className="mic-load-more-articles">Load More Articles</a>;
		}

		if (state.shouldSort) {

			articles.sort(this.articleComparator);
		}

		articleNodes = _.map(articles, articleMapper);

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

	articleComparator: function (a, b) {
		var state = this.state,
			aArticle = state.sortDir === 'ASC' ? a : b,
			bArticle = state.sortDir === 'ASC' ? b : a,
			aField = state.sortCol === 'words' ? aArticle.words : new Date(aArticle.publish_at),
			bField = state.sortCol === 'words' ? bArticle.words : new Date(bArticle.publish_at);

		if (aField > bField) {

			return 1;
		}

		if (aField < bField) {

			return -1;
		}

		return 0;
	},

	getInitialState: function() {
		var localStorage = window.localStorage,
			sortCol = localStorage.getItem('sortCol') || 'submitted',
			sortDir = localStorage.getItem('sortDir') || 'ASC';

		return {
			start: 0,
			stop: 0,
			sortCol: sortCol,
			sortDir: sortDir,
			showLoadMore: true,
			shouldSort: true,
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
			shouldSort: false,
			stop: newStop,
			// Show the load more button until we've loaded the more articles data and we've reached the end of them
			showLoadMore: !(state.moreArticlesLoaded && newStop >= state.articles.length)
		});
	},

	sortArticles: function (evt) {
		var sortCol = _.last(evt.target.className.match(/article-([^-]+)-/)),
			sortDir = this.state.sortDir === 'ASC' ? 'DESC' : 'ASC',
			localStorage = window.localStorage;

		localStorage.setItem('sortCol', sortCol);
		localStorage.setItem('sortDir', sortDir);

		this.setState({
			shouldSort: true,
			sortCol: sortCol,
			sortDir: sortDir
		});
	},

	componentDidMount: function() {
		$('.mic-load-more-articles').on('click', this.loadMoreArticles);
		$('.mic-article-words-col, .mic-article-submitted-col').on('click', this.sortArticles);

		this.fetchArticles('data/articles.json');
	}
});