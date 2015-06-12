/** @jsx React.DOM */

/**
 *
 * Article List Component.
 *
 * I decided to implement the demo using webpack and React because I have wanted
 * to use these technologies and I thought it would be a good opportunity.
 * 
 * For the most part I enojyed working with these, webpack was super easy to get
 * up and running with, and provides and excellent dev experience with built in
 * live reload including jsx and sass compilation.
 *
 * There is one major issue I see with my implementation, and it seems somewhat
 * rooted in the React pattern of updating the state of the componenet and letting
 * the shadow DOM decide how to manipulate the DOM. When loading articles after
 * the list has been sorted, the next group of articles is interspersed with the
 * original articles, subsequent loading of articles appends the new articles to 
 * the bottom of the list as would be expected. Being new to React, there maybe
 * somehting I am missing, in a production setting I would have worked to resolve
 * this issue, there are multiple ways to do it but I did not see a way that didn't
 * "break" the React pattern so I left it as is.
 */

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
		formattedDate = moment(new Date(article.publish_at)).format('MMMM Do YYYY, h:mm:ss a'),
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
			<div className="mic-article-submitted-col" title={formattedDate}>{timeStr}</div>
		</article>
	);
}

module.exports = React.createClass({
	// Fetch articles using jQuery
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

	// When we get new data, update the components state, triggering a render
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

	// Output the article list
	render: function () {
		var state = this.state,
			articles = _.clone(state.articles).slice(state.start, state.stop),
			classNameMap = {
				words: 'mic-article-words-col',
				submitted: 'mic-article-submitted-col'
			},
			loadBtn = '',
			articleNodes;

		if (state.showLoadMore) {

			loadBtn = <a href="#" className="mic-load-more-articles">Load More Articles</a>;
		}

		if (state.shouldSort) {

			articles.sort(this.articleComparator);
		}

		classNameMap[state.sortCol] = [classNameMap[state.sortCol], ' mic-sorted-', state.sortDir].join('');
		articleNodes = _.map(articles, articleMapper);

		return (
			<div className="mic-article-list">
				<div className="mic-header-row">
					<div className="mic-article-title-col">Unpublished Articles</div>
					<div className="mic-article-author-col">Author</div>
					<div className={classNameMap.words}>Words</div>
					<div className={classNameMap.submitted}>Submitted</div>
				</div>

				{articleNodes}
				{loadBtn}
			</div>
		);
	},

	// Performs sort based on current state
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

	// Set defaults
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

	// Get more articles from cache ot the more-articles.json file
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

	// Sort the list
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