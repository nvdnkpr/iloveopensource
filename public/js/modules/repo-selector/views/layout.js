/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 8/13/13
 * Time: 1:33 AM
 */
define(function (require) {
	require('backbone')

	var toastr = require('toastr')
	var RepoList = require('./repo-list')
	var RepoSearch = require('./search')
	var SelectedRepos = require('./selected')
	var store = require('store').getNamespace('repo-selector')
	var tpl = require('tpl!../templates/layout.html')

	return Backbone.View.extend({
		events: {
			'click #save-changes': 'saveChanges'
		},
		initialize: function () {
			this.listenTo(store().hub, 'repos-loaded', this.renderRepoList)
			this.listenTo(store().selected, 'add', this.updateSelectedCount)
			this.listenTo(store().selected, 'remove', this.updateSelectedCount)
			this.render()
		},
		updateSelectedCount: function (model, collection) {
			this.$('#selected-count').text(collection.length)
		},
		saveChanges: function () {
			var btn = $('#save-changes')
			if (btn.attr('disabled')) return

			btn.attr('disabled', true)

			store().selected.save()
				.done(function () {
					toastr.success('All changes saved!', 'Success!')
				})
				.fail(function (xhr) {
					toastr.error(xhr.responseText, 'Error!')
				})
				.always(function () {
					btn.attr('disabled', false)
				})
		},
		render: function () {
			var self = this

			this.$('#repos-selector').html(tpl({
				selectedCount: store().selected.length
			}))

			new RepoSearch({
				el: this.$('#repo-search'),
				collection: store().repos.search
			}).render()

			new SelectedRepos({
				el: this.$('#selected-repos'),
				collection: store().selected
			}).render()
		},
		renderRepoList: function (collection, type) {
			if (type == 'search') return
			this.$('a[href="#' + type + '-repos"]').parent().removeClass('disabled')

			var view = new RepoList({
				el: this.$('#' + type + '-repos'),
				collection: collection
			})

			view.render()
		}
	});
})