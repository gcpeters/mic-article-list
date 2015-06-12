/** @jsx React.DOM */

'use strict';

var React = require('React'),
	moment = require('moment'),
	_ = require('lodash');

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

function fetch (ops) {
    var xmlhttp = new XMLHttpRequest(),
    	noop = function () {};

    ops = _.extend({
    	url: 'data/articles.json',
    	success: noop,
    	error: noop
    }, ops);

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === XMLHttpRequest.DONE ) {

           if (xmlhttp.status === 200){

           		try {

           			ops.success(JSON.parse(xmlhttp.responseText));
           		} catch (err) {

           			ops.error(err);
           		}
           } else if (xmlhttp.status === 400) {

              ops.error('There was an error 400');
           } else {
               ops.error('something else other than 200 was returned');
           }
        }
    };

    xmlhttp.open('GET', ops.url, true);
    xmlhttp.send();
}

module.exports = React.createClass({
	fetchArticles: function (url) {
		fetch({
			url: url,
			success: this.onArticlesReady,

			error: function (xhr, status, err) {
				console.error && console.error(url, status, err.toString());
			}
		});
	},

	onArticlesReady: function (articles) {
		this.setState({
			articles: articles
		});
	},

	render: function () {
		var articleNodes = _.map(this.state.articles, articleMapper);

		return (
			<div className="mic-article-list">
				{articleNodes}
			</div>
		);
	},

	getInitialState: function() {
		return {
			articles: []
		};
	},

	componentDidMount: function() {
		this.fetchArticles('data/articles.json');
	}
});