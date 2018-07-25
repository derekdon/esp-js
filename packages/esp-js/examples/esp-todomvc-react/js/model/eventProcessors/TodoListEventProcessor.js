/*global esp, app*/

(function () {
	'use strict';

	var extend = app.Utils.extend;

	var TodoListEventProcessor = function (router, modelId) {
		esp.DisposableBase.call(this);
		this.router = router;
		this.modelId = modelId;
	};

	TodoListEventProcessor.prototype = Object.create(esp.DisposableBase.prototype);

	TodoListEventProcessor.prototype.start = function () {
		this.observeInitEvent();
		this.observeToggleEvent();
		this.observeToggleAllEvent();
		this.observeTodoDestroyedEvent();
		this.observeTodoAddedEvent();
		this.observeFilterChangedEvent();
		this.observeClearCompletedEvent();
		this.observeEditStartedEvent();
		this.observeEditCancelledEvent();
		this.observeEditCompletedEvent();
	};

	TodoListEventProcessor.prototype.observeInitEvent = function () {
		this.addDisposable(this.router
			.getEventObservable(this.modelId, 'initEvent')
			.subscribe(function (event, context, model) {
				var todoItems = app.Utils.store(model.localStorageKey);
				var todoItemsById = {};
				if (todoItems) {
					todoItems.forEach(function (todoItem) {
						todoItemsById[todoItem.id] = todoItem;
					});
					model.todoItemsById = todoItemsById;
				}
			})
			);
	};

	TodoListEventProcessor.prototype.observeToggleEvent = function () {
		this.addDisposable(this.router
			.getEventObservable(this.modelId, 'todoToggled')
			.subscribe(function (event, context, model) {
				var todoItem = model.todoItemsById[event.id];
				todoItem = extend({}, todoItem, { complete: !todoItem.complete });
				model.todoItemsById[todoItem.id] = todoItem;
				this.save(model);
			}.bind(this))
			);
	};

	TodoListEventProcessor.prototype.observeToggleAllEvent = function () {
		this.addDisposable(this.router
			.getEventObservable(this.modelId, 'toggleAll')
			.subscribe(function (event, context, model) {
				model.mainSection.filteredTodoItems.forEach(function (todoItem) {
					todoItem = extend({}, todoItem, { complete: event.checked });
					model.todoItemsById[todoItem.id] = todoItem;
				});
				this.save(model);
			}.bind(this))
			);
	};

	TodoListEventProcessor.prototype.observeTodoAddedEvent = function () {
		this.addDisposable(this.router
			.getEventObservable(this.modelId, 'todoAdded')
			.subscribe(function (event, context, model) {
				var id = app.Utils.uuid();
				var todoItem = new app.model.TodoItem(id, event.title);
				model.todoItemsById[id] = todoItem;
				this.save(model);
			}.bind(this))
			);
	};

	TodoListEventProcessor.prototype.observeTodoDestroyedEvent = function () {
		this.addDisposable(this.router
			.getEventObservable(this.modelId, 'todoDestroyed')
			.subscribe(function (event, context, model) {
				delete model.todoItemsById[event.id];
				this.save(model);
			}.bind(this))
			);
	};

	TodoListEventProcessor.prototype.observeFilterChangedEvent = function () {
		this.addDisposable(this.router
			.getEventObservable(this.modelId, 'filterChanged')
			.subscribe(function (event, context, model) {
				model.footer.filter = event.filter;
			})
			);
	};

	TodoListEventProcessor.prototype.observeClearCompletedEvent = function () {
		this.addDisposable(this.router
			.getEventObservable(this.modelId, 'clearCompleted')
			.subscribe(function (event, context, model) {
				var ids = Object.keys(model.todoItemsById);
				var id;
				for (var i = 0; i < ids.length; i++) {
					id = ids[i];
					if (model.todoItemsById[id].complete) {
						delete model.todoItemsById[id];
					}
				}
				this.save(model);
			}.bind(this))
			);
	};

	TodoListEventProcessor.prototype.observeEditStartedEvent = function () {
		this.addDisposable(this.router
			.getEventObservable(this.modelId, 'editStarted')
			.subscribe(function (event, context, model) {
				var todoItem = model.todoItemsById[event.id];
				model.todoItemsById[todoItem.id] = extend({}, todoItem, { editing: true });
			})
			);
	};

	TodoListEventProcessor.prototype.observeEditCancelledEvent = function () {
		this.addDisposable(this.router
			.getEventObservable(this.modelId, 'editCancelled')
			.subscribe(function (event, context, model) {
				var todoItem = model.todoItemsById[event.id];
				model.todoItemsById[todoItem.id] = extend({}, todoItem, { editing: false });
			})
			);
	};

	TodoListEventProcessor.prototype.observeEditCompletedEvent = function () {
		this.addDisposable(this.router
			.getEventObservable(this.modelId, 'editCompleted')
			.subscribe(function (event, context, model) {
				var todoItem = model.todoItemsById[event.id];
				model.todoItemsById[todoItem.id] = extend({}, todoItem, { title: event.title, editing: false });
				this.save(model);
			}.bind(this))
			);
	};

	TodoListEventProcessor.prototype.save = function (model) {
		var todoItems = [];
		var ids = Object.keys(model.todoItemsById);
		var id;
		for (var i = 0; i < ids.length; i++) {
			id = ids[i];
			todoItems.push(model.todoItemsById[id]);
		}
		app.Utils.store(model.localStorageKey, todoItems);
	};

	app.model.TodoListEventProcessor = TodoListEventProcessor;
}());
