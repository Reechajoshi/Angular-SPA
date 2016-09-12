var feeds = [];
var video_src = [];
var app = angular.module('feedModule', ['ngResource','ngSanitize']);

app.factory('FeedLoader', function ($resource) {
	return $resource('http://ajax.googleapis.com/ajax/services/feed/load', {}, {
		fetch: { method: 'JSONP', params: {v: '1.0', callback: 'JSON_CALLBACK'} }
	});
});

app.service('FeedList', function ($rootScope, FeedLoader) {
	this.get = function() {
		// create an array of feeds and their titles
		var feedSources = {title: 'Tours FC', url: 'http://www.toursfc.fr/rss-actus-chrono.php'};
		// var feedSources = {title: 'Tours FC', url: 'http://feeds.feedburner.com/TEDTalks_video'};
		
		// FeedLoader will fetch the rss feed in form of json
		FeedLoader.fetch({q: feedSources.url, num: 10}, {}, function (data) {
			// retrive the responseData and assign it to feed variable
			var feed = data.responseData.feed;

			$(feed.entries).each(function(){$(this).push({"richa":"joshi"});});

			// since, content of feed contains HTML elements, detect if it has images or videos, images have relative path, convert it to absolute.
			for(var i=0; i < feed.entries.length; i++) {
				var htmlObject = document.createElement('div');

				htmlObject.innerHTML = feed.entries[i].content;

				// search for image and change src from relative to absolute
				var img_src = $(htmlObject).find("img").eq(0).attr('src');
				$(htmlObject).find("img").eq(0).attr('src', "http://www.toursfc.fr/"+img_src);

				feed.entries[i].img_src = $(htmlObject).find("img").eq(0).attr('src');

				if(typeof($(htmlObject).find("iframe").attr("src")) == 'string')
				{
					// video_src.push($(htmlObject).find("iframe").attr("src"));
					// $(htmlObject).html("<a href='"+( $(htmlObject).find("iframe").attr("src") )+"'>Click here to view the video</a>");	
					var video_src = $(htmlObject).find("iframe").attr("src");
					
					if(video_src.indexOf("youtube.com")>-1)
					{
						var video_id = video_src.split('v=')[1];
						var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    						var match = video_src.match(regExp);
					    	if (match&&match[7].length==11){	
					        	feed.entries[i].img_src = "http://img.youtube.com/vi/"+match[7]+"/mqdefault.jpg";
						}
					}
					else
					{
						var video_id = video_src.split('/');
						var cnt = video_id.length;
						var id = video_id[cnt-1];
						// var img_json_url = "https://api.dailymotion.com/video/VIDEO_ID?fields=thumbnail_medium_url%20(160px by 120px)";
						var url = "http://www.dailymotion.com/thumbnail/video/"+id;
						feed.entries[i].img_src = url;
					}
				}
				
				feed.entries[i].content = $(htmlObject).prop('outerHTML');
				
			}
			feeds.push(feed);
		});
		return feeds;
	};
});



app.controller('FeedCtrl', function ($scope, FeedList) {
	var data = FeedList.get();
	$scope.feeds = data;

	$scope.$on('FeedList', function (event, data) {
		$scope.feeds = data;
	});
});













