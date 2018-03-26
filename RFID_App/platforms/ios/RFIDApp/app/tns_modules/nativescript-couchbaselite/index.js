"use strict";
var def = require("./index");
var class_transformer_1 = require("class-transformer");
var commons_1 = require("./commons");
var commons_2 = require("./commons");
exports.AttachmentImage = commons_2.AttachmentImage;
exports.IndexUpdateMode = commons_2.IndexUpdateMode;
exports.Log = commons_2.Log;
exports.ReplicationError = commons_2.ReplicationError;
exports.ReplicationStatus = commons_2.ReplicationStatus;
exports.Storage = commons_2.Storage;
var DatabaseManager = (function () {
    function DatabaseManager() {
        this.manager = null;
    }
    DatabaseManager.get = function () {
        if (DatabaseManager.instance == null) {
            DatabaseManager.instance = new DatabaseManager();
            DatabaseManager.instance.manager = CBLManager.sharedInstance();
            if (!DatabaseManager.instance.manager) {
                throw "Failed creating CBLManager";
            }
        }
        return DatabaseManager.instance;
    };
    DatabaseManager.getOrCreate = function (opts) {
        try {
            var instance = DatabaseManager.get();
            var db = void 0;
            if (opts.encryptionKey) {
                var dbOpt = new CBLDatabaseOptions();
                dbOpt.encryptionKey = opts.encryptionKey;
                dbOpt.create = opts.create;
                db = instance.manager.openDatabaseNamedWithOptionsError(opts.name, dbOpt);
            }
            else {
                db = instance.manager.databaseNamedError(opts.name);
            }
            return new Database(db);
        }
        catch (exception) {
            throw "Failed to create db with name:" + opts.name + "." + exception;
        }
    };
    DatabaseManager.getExisting = function (opts) {
        try {
            var instance = DatabaseManager.get();
            var db = void 0;
            if (opts.encryptionKey) {
                var dbOpt = new CBLDatabaseOptions();
                dbOpt.encryptionKey = opts.encryptionKey;
                dbOpt.create = false;
                db = instance.manager.openDatabaseNamedWithOptionsError(opts.name, dbOpt);
            }
            else {
                db = instance.manager.databaseNamedError(opts.name);
            }
            if (db == null) {
                throw "Failed to open db with name:" + opts.name;
            }
            else {
                return new Database(db);
            }
        }
        catch (exception) {
            throw "Failed to open db with name:" + opts.name + ".\n" + exception;
        }
    };
    return DatabaseManager;
}());
exports.DatabaseManager = DatabaseManager;
var Mapper = (function () {
    function Mapper() {
        this.jsDateToTime = false;
        this.mapping = new Map();
    }
    Mapper.prototype.copy = function () {
        var m = new Mapper;
        m.mapping = this.mapping;
        return m;
    };
    Mapper.prototype.setMapping = function (m) {
        this.mapping = m;
    };
    Mapper.prototype.toJSSAfe = function (nsO) {
        var isInstance = function (a) {
            if (nsO && nsO.class) {
                return nsO.class == a.class;
            }
            return false;
        };
        if (nsO == null) {
            return null;
        }
        else if (commons_1.JSTypeChecker.isString(nsO)
            || commons_1.JSTypeChecker.isBoolean(nsO)
            || commons_1.JSTypeChecker.isInt(nsO)
            || commons_1.JSTypeChecker.isFloat(nsO)
            || commons_1.JSTypeChecker.isDate(nsO)
            || isInstance(NSString)
            || isInstance(NSNumber)) {
            return nsO;
        }
        else if (isInstance(NSArray) || isInstance(NSMutableArray)) {
            var coll = nsO;
            var array = [];
            for (var i = 0; i < coll.count; i++) {
                array.push(this.toJSSAfe(coll.objectAtIndex(i)));
            }
            return array;
        }
        else if (isInstance(NSDictionary) || isInstance(NSMutableDictionary)) {
            return this.mapToJson(nsO);
        }
        else if (isInstance(NSDate)) {
            return nsO;
        }
        else {
            var data = NSJSONSerialization.dataWithJSONObjectOptionsError(nsO, 1 /* PrettyPrinted */);
            return JSON.parse(NSString.alloc().initWithDataEncoding(data, NSUTF8StringEncoding));
        }
    };
    Mapper.prototype.toObjcSafe = function (jsO) {
        var _this = this;
        if (commons_1.JSTypeChecker.isUndefined(jsO)) {
            return null;
        }
        else if (commons_1.JSTypeChecker.isArray(jsO)) {
            var array_1 = NSMutableArray.arrayWithCapacity(jsO.length);
            jsO.forEach(function (a, index) { return array_1.insertObjectAtIndex(_this.toObjcSafe(a), index); });
            return array_1;
        }
        else if (commons_1.JSTypeChecker.isMap(jsO)) {
            var array_2 = NSMutableDictionary.dictionaryWithCapacity(jsO.size);
            jsO.forEach(function (value, key) { return array_2.setObjectForKey(_this.toObjcSafe(value), _this.toObjcSafe(key)); });
            return array_2;
        }
        else if (commons_1.JSTypeChecker.isBoolean(jsO)) {
            return jsO;
        }
        else if (commons_1.JSTypeChecker.isString(jsO)
            || commons_1.JSTypeChecker.isInt(jsO)
            || commons_1.JSTypeChecker.isFloat(jsO)) {
            return jsO;
        }
        else if (commons_1.JSTypeChecker.isDate(jsO)) {
            if (this.jsDateToTime) {
                return jsO.getTime();
            }
            else {
                return jsO;
            }
        }
        else {
            return this.jsonToMap(jsO);
        }
    };
    //TODO add class to runtime
    Mapper.prototype.jsonToMap = function (json) {
        var jsonString = json;
        if (typeof json !== "string") {
            jsonString = JSON.stringify(json);
        }
        var data = NSString.stringWithString(jsonString).dataUsingEncoding(NSUTF8StringEncoding);
        return NSJSONSerialization.JSONObjectWithDataOptionsError(data, 1 /* MutableContainers */);
    };
    Mapper.prototype.mapToJson = function (map) {
        if (typeof map === "undefined" || map == null) {
            return null;
        }
        var type = map.objectForKey("docType");
        var data = NSJSONSerialization.dataWithJSONObjectOptionsError(map, 1 /* PrettyPrinted */);
        var jsonString = NSString.alloc().initWithDataEncoding(data, NSUTF8StringEncoding);
        if (this.mapping.has(type)) {
            return class_transformer_1.deserialize(this.mapping.get(type), jsonString);
        }
        else {
            return JSON.parse(jsonString);
        }
    };
    return Mapper;
}());
var Database = (function () {
    function Database(db) {
        this.db = db;
        this.mapper = new Mapper();
    }
    Database.prototype.setMapping = function (m) {
        this.mapper.setMapping(m);
    };
    Database.prototype.purge = function (id) {
        var document = this.db.documentWithID(id);
        if (document != null) {
            document.purgeDocument();
        }
    };
    Database.prototype.createDocument = function (data, id, opts) {
        try {
            var document = null;
            if (id) {
                document = this.db.documentWithID(id);
            }
            else {
                document = this.db.createDocument();
            }
            if (opts) {
                opts.ttl && (document.expirationDate = opts.ttl);
            }
            data.docId = document.documentID;
            var rev = document.putPropertiesError(this.mapper.jsonToMap(data));
            data.docRev = rev.revisionID;
        }
        catch (exception) {
            throw "Failed to createDocument:" + exception;
        }
    };
    Database.prototype.getDocument = function (id) {
        var document = this.db.existingDocumentWithID(id);
        if (document != null && document.properties != null) {
            var value = this.mapper.mapToJson(document.properties);
            value.docId = document.documentID;
            value.docRev = document.currentRevisionID;
            return value;
        }
        else {
            return null;
        }
    };
    Database.prototype.updateDocument = function (id, data, opts) {
        try {
            var document = this.db.documentWithID(id);
            data.docId = document.documentID;
            data.docRev = document.currentRevisionID;
            if (opts) {
                opts.ttl && (document.expirationDate = opts.ttl);
            }
            document.putPropertiesError(this.mapper.jsonToMap(data));
        }
        catch (exception) {
            throw "Failed to updateDocument:" + exception;
        }
    };
    Database.prototype.deleteDocument = function (id) {
        try {
            var document = this.db.documentWithID(id);
            document.deleteDocument();
            return document.isDeleted;
        }
        catch (exception) {
            throw "Failed to deleteDocument:" + exception;
        }
    };
    Database.prototype.getConflicts = function (id) {
        var document = this.db.documentWithID(id);
        var revs = document.getConflictingRevisions();
        var all = [];
        for (var i = 0; i < revs.count; i++) {
            var temp = revs.objectAtIndex(i);
            all.push({
                id: temp.document.documentID,
                object: this.mapper.mapToJson(temp.document.properties),
                revid: temp.revisionID
            });
        }
        return all;
    };
    Database.prototype.resolveConflict = function (id, merged) {
        var _this = this;
        var self = this;
        this.db.inTransaction(function () {
            try {
                var document = _this.db.documentWithID(id);
                var current = document.currentRevision;
                var revs = document.getConflictingRevisions();
                for (var i = 0; i < revs.count; i++) {
                    var rev = revs.objectAtIndex(i);
                    var newRev = rev.createRevision();
                    if (rev.revisionID == current.revisionID) {
                        newRev.properties = NSMutableDictionary.dictionaryWithDictionary(self.mapper.jsonToMap(merged));
                    }
                    else {
                        newRev.isDeletion = true;
                    }
                    newRev.saveAllowingConflict();
                }
                return true;
            }
            catch (exception) {
                return false;
            }
        });
    };
    Database.prototype.getAttachment = function (id, name) {
        var doc = this.db.documentWithID(id);
        var rev = doc.currentRevision;
        var att = rev.attachmentNamed(name);
        if (att != null) {
            return new AttachmentDefault(att);
        }
        else {
            return null;
        }
    };
    Database.prototype.getAttachmentNames = function (id) {
        var doc = this.db.documentWithID(id);
        var rev = doc.currentRevision;
        var names = rev.attachmentNames;
        var array = [];
        if (names != null) {
            for (var i = 0; i < names.count; i++) {
                var temp = names.objectAtIndex(i);
                array.push(temp);
            }
        }
        return array;
    };
    Database.prototype.getAttachments = function (id) {
        var doc = this.db.documentWithID(id);
        var rev = doc.currentRevision;
        var names = rev.attachments;
        var array = [];
        if (names != null) {
            for (var i = 0; i < names.count; i++) {
                var temp = names.objectAtIndex(i);
                array.push(new AttachmentDefault(temp));
            }
        }
        return array;
    };
    Database.prototype.setAttachment = function (id, file) {
        var doc = this.db.documentWithID(id);
        var newRev = doc.currentRevision.createRevision();
        newRev.setAttachmentNamedWithContentTypeContent(file.getName(), file.getType(), file.getStream());
        newRev.save();
    };
    Database.prototype.removeAttachment = function (id, name) {
        var doc = this.db.documentWithID(id);
        var newRev = doc.currentRevision.createRevision();
        newRev.removeAttachmentNamed(name);
        newRev.save();
    };
    Database.prototype.createView = function (opts) {
        var _this = this;
        var self = this;
        var view = this.db.viewNamed(opts.name);
        var mapper = function (document, emit) {
            try {
                var value = self.mapper.mapToJson(document);
                opts.map(value, new Emitter(emit, _this.mapper.copy()));
            }
            finally {
            }
        };
        if (opts.reduce) {
            view.setMapBlockReduceBlockVersion(mapper, function (keys, values, rereduce) {
                var keysJson = self.mapper.toJSSAfe(keys);
                var valuesJson = self.mapper.toJSSAfe(values);
                var result = opts.reduce(keysJson, valuesJson, rereduce);
                return self.mapper.toObjcSafe(result);
            }, opts.revision);
        }
        else {
            view.setMapBlockVersion(mapper, opts.revision);
        }
    };
    Database.prototype.prepareQuery = function (query, queryM) {
        this.isDefined(query.onlyConflict) && (queryM.allDocsMode = 3 /* kCBLOnlyConflicts */);
        this.isDefined(query.inclusiveStart) && (queryM.inclusiveStart = query.inclusiveStart);
        this.isDefined(query.inclusiveEnd) && (queryM.inclusiveEnd = query.inclusiveEnd);
        this.isDefined(query.descending) && (queryM.descending = query.descending);
        this.isDefined(query.endKey) && (queryM.endKey = this.mapper.toObjcSafe(query.endKey));
        this.isDefined(query.endKeyDocID) && (queryM.endKeyDocID = query.endKeyDocID);
        this.isDefined(query.groupLevel) && (queryM.groupLevel = query.groupLevel);
        if (this.isDefined(query.indexUpdateMode)) {
            switch (query.indexUpdateMode) {
                case def.IndexUpdateMode.AFTER:
                    queryM.indexUpdateMode = 2 /* kCBLUpdateIndexAfter */;
                    break;
                case def.IndexUpdateMode.BEFORE:
                    queryM.indexUpdateMode = 0 /* kCBLUpdateIndexBefore */;
                    break;
                case def.IndexUpdateMode.NEVER:
                    queryM.indexUpdateMode = 1 /* kCBLUpdateIndexNever */;
                    break;
            }
        }
        this.isDefined(query.keys) && (queryM.keys = this.mapper.toObjcSafe(query.keys));
        this.isDefined(query.limit) && (queryM.limit = query.limit);
        this.isDefined(query.mapOnly) && (queryM.mapOnly = query.mapOnly);
        this.isDefined(query.prefixMatchLevel) && (queryM.prefixMatchLevel = query.prefixMatchLevel);
        this.isDefined(query.skip) && (queryM.skip = query.skip);
        this.isDefined(query.startKey) && (queryM.startKey = this.mapper.toObjcSafe(query.startKey));
        this.isDefined(query.startKeyDocID) && (queryM.startKeyDocID = query.startKeyDocID);
    };
    Database.prototype.queryView = function (name, query) {
        var queryM = this.db.viewNamed(name).createQuery();
        this.prepareQuery(query, queryM);
        var resEnum = queryM.run();
        return new QueryResult(queryM, resEnum, this.mapper.copy());
    };
    Database.prototype.queryAllDocuments = function (query) {
        var queryM = this.db.createAllDocumentsQuery();
        this.prepareQuery(query, queryM);
        var resEnum = queryM.run();
        return new QueryResult(queryM, resEnum, this.mapper.copy());
    };
    Database.prototype.liveQuery = function (name, query, listener) {
        var _this = this;
        var view = this.db.viewNamed(name);
        var queryM = view.createQuery();
        this.prepareQuery(query, queryM);
        var live = queryM.asLiveQuery();
        var self = this;
        var ObserverLive = (function (_super) {
            __extends(ObserverLive, _super);
            function ObserverLive() {
                _super.apply(this, arguments);
            }
            ObserverLive.prototype.observeValueForKeyPath = function (keyPath, ofObject, change, context) {
                if (ofObject == live) {
                    var rows = new QueryResult(live, live.rows, self.mapper.copy());
                    listener.onRows(rows);
                }
            };
            ObserverLive.init = function () {
                var observer = _super.new.call(this);
                return observer;
            };
            return ObserverLive;
        }(NSObject));
        var observer = ObserverLive.init();
        live.addObserverForKeyPathOptionsContext(observer, "rows", null, null);
        return {
            waitForRows: function () {
                live.waitForRows();
            },
            updateIndex: function () {
                view.updateIndex();
            },
            start: function () {
                live.start();
            },
            stop: function () {
                live.stop();
            },
            run: function () {
                var res = live.run();
                return new QueryResult(live, live.rows, _this.mapper.copy());
            }
        };
    };
    Database.prototype.addChangeListener = function (listener) {
        try {
            var mainQueue = NSOperationQueue.mainQueue;
            NSNotificationCenter.defaultCenter.addObserverForNameObjectQueueUsingBlock(kCBLDatabaseChangeNotification, this.db, mainQueue, function (n) {
                if (n.userInfo) {
                    var changes = n.userInfo.objectForKey("changes");
                    var all = [];
                    for (var i = 0; i < changes.count; i++) {
                        var change = changes.objectAtIndex(i);
                        all.push({
                            documentId: change.documentID,
                            revisionId: change.revisionID,
                            isConflict: change.inConflict,
                            isCurrentRevision: change.isCurrentRevision,
                            isDeletion: change.isDeletion,
                            source: (change.source != null) ? change.source.absoluteString : null
                        });
                    }
                    listener.onChange(all);
                }
            });
        }
        catch (exception) {
            throw "Failed to listen changes..." + exception;
        }
    };
    Database.prototype.createPullReplication = function (url) {
        try {
            var pull = this.db.createPullReplication(NSURL.URLWithString(url));
            return new ReplicationPull(pull, this.db, this.mapper.copy());
        }
        catch (exception) {
            throw "Failed to create pull replication..." + exception;
        }
    };
    Database.prototype.createPushReplication = function (url) {
        try {
            var pull = this.db.createPushReplication(NSURL.URLWithString(url));
            return new ReplicationPush(pull, this.db, this.mapper.copy());
        }
        catch (exception) {
            throw "Failed to create push replication..." + exception;
        }
    };
    Database.prototype.createFilter = function (opts) {
        var _this = this;
        this.db.setFilterNamedAsBlock(opts.name, function (revision, params) {
            var pa = _this.mapper.toJSSAfe(params);
            return opts.filter({
                id: revision.document.documentID,
                revid: revision.revisionID,
                object: _this.mapper.mapToJson(revision.document.properties)
            }, pa);
        });
    };
    Database.prototype.destroy = function () {
        try {
            this.db.deleteDatabase();
        }
        catch (exception) {
            throw "Failed to destroy db..." + exception;
        }
    };
    Database.prototype.close = function () {
        try {
            this.db.close();
        }
        catch (exception) {
            throw "Failed to close db..." + exception;
        }
    };
    Database.prototype.isDefined = function (variable) {
        return (typeof variable !== 'undefined' && variable != null);
    };
    return Database;
}());
exports.Database = Database;
var QueryResult = (function () {
    function QueryResult(query, resEnum, mapper) {
        this.query = query;
        this.resEnum = resEnum;
        this.mapper = mapper;
        this.ids = null;
        this.documents = null;
        this.values = null;
        var result = [];
        for (var i = 0; i < resEnum.count; i++) {
            var row = resEnum.rowAtIndex(i);
            if (row.value != null) {
                var doc = this.mapper.toJSSAfe(row.value);
                result.push(doc);
            }
            else if (row.document != null) {
                var prop = row.document.properties;
                var doc = this.mapper.mapToJson(prop);
                result.push(doc);
            }
        }
    }
    QueryResult.prototype.getDocuments = function () {
        this.resEnum.reset();
        if (this.documents == null) {
            this.documents = [];
            for (var i = 0; i < this.resEnum.count; i++) {
                var row = this.resEnum.rowAtIndex(i);
                if (row.document != null) {
                    var prop = row.document.properties;
                    var doc = this.mapper.mapToJson(prop);
                    doc = row.document.documentID;
                    this.documents.push(doc);
                }
            }
        }
        return this.documents;
    };
    QueryResult.prototype.firstDocument = function () {
        var docs = this.getDocuments();
        return docs.length > 0 ? docs[0] : null;
    };
    QueryResult.prototype.firstValue = function () {
        var docs = this.getValues();
        return docs.length > 0 ? docs[0] : null;
    };
    QueryResult.prototype.firstId = function () {
        var docs = this.getDocumentsId();
        return docs.length > 0 ? docs[0] : null;
    };
    QueryResult.prototype.hasDocuments = function () {
        var docs = this.getDocuments();
        return docs.length > 0;
    };
    QueryResult.prototype.hasValues = function () {
        var docs = this.getValues();
        return docs.length > 0;
    };
    QueryResult.prototype.hasIds = function () {
        var docs = this.getDocumentsId();
        return docs.length > 0;
    };
    QueryResult.prototype.getValues = function () {
        this.resEnum.reset();
        if (this.values == null) {
            this.values = [];
            for (var i = 0; i < this.resEnum.count; i++) {
                var row = this.resEnum.rowAtIndex(i);
                if (row.value != null) {
                    var doc = this.mapper.toJSSAfe(row.value);
                    this.values.push(doc);
                }
            }
        }
        return this.values;
    };
    QueryResult.prototype.getDocumentsId = function () {
        if (this.ids == null) {
            this.ids = [];
            for (var i = 0; i < this.resEnum.count; i++) {
                var row = this.resEnum.rowAtIndex(i);
                if (row.documentID != null) {
                    this.ids.push(row.documentID);
                }
            }
        }
        return this.ids;
    };
    QueryResult.prototype.rerun = function () {
        this.documents = null;
        this.ids = null;
        this.values = null;
        this.resEnum = this.query.run();
    };
    return QueryResult;
}());
exports.QueryResult = QueryResult;
var Replication = (function () {
    function Replication() {
    }
    Replication.prototype.addChangeListener = function (listener) {
        var self = this;
        var mainQueue = NSOperationQueue.mainQueue;
        NSNotificationCenter.defaultCenter.addObserverForNameObjectQueueUsingBlock("CBLReplicationChange", this.observed(), mainQueue, function (n) {
            if (n.object) {
                var replic = n.object;
                var status = null;
                switch (replic.status) {
                    case 3 /* kCBLReplicationActive */:
                        status = def.ReplicationStatus.Active;
                        break;
                    case 2 /* kCBLReplicationIdle */:
                        status = def.ReplicationStatus.Idle;
                        break;
                    case 1 /* kCBLReplicationOffline */:
                        status = def.ReplicationStatus.Offline;
                        break;
                    case 0 /* kCBLReplicationStopped */:
                        status = def.ReplicationStatus.Stopped;
                        break;
                }
                listener.onChange({
                    changesCount: replic.changesCount,
                    completedChangesCount: replic.completedChangesCount,
                    lastError: (replic.lastError == null) ? null : replic.lastError.description,
                    lastErrorCode: (replic.lastError == null) ? null : replic.lastError.code,
                    status: status
                });
            }
        });
    };
    return Replication;
}());
var ReplicationPull = (function (_super) {
    __extends(ReplicationPull, _super);
    function ReplicationPull(innerPull, db, mapper) {
        _super.call(this);
        this.innerPull = innerPull;
        this.db = db;
        this.mapper = mapper;
    }
    ReplicationPull.prototype.observed = function () { return this.innerPull; };
    ReplicationPull.prototype.setContinuous = function (cont) {
        this.innerPull.continuous = true;
    };
    ReplicationPull.prototype.setBasicAuthenticator = function (user, password) {
        this.innerPull.authenticator = CBLAuthenticator.basicAuthenticatorWithNamePassword(user, password);
    };
    ReplicationPull.prototype.restart = function () {
        this.innerPull.restart();
    };
    ReplicationPull.prototype.start = function () {
        this.innerPull.start();
    };
    ReplicationPull.prototype.stop = function () {
        this.innerPull.stop();
    };
    ReplicationPull.prototype.channels = function (channels) {
        this.innerPull.channels = this.mapper.toObjcSafe(channels);
    };
    ReplicationPull.prototype.setDocIds = function (docs) {
        this.innerPull.documentIDs = this.mapper.toObjcSafe(docs);
    };
    return ReplicationPull;
}(Replication));
exports.ReplicationPull = ReplicationPull;
var ReplicationPush = (function (_super) {
    __extends(ReplicationPush, _super);
    function ReplicationPush(innerPush, db, mapper) {
        _super.call(this);
        this.innerPush = innerPush;
        this.db = db;
        this.mapper = mapper;
    }
    ReplicationPush.prototype.observed = function () { return this.innerPush; };
    ReplicationPush.prototype.setContinuous = function (cont) {
        this.innerPush.continuous = true;
    };
    ReplicationPush.prototype.setBasicAuthenticator = function (user, password) {
        this.innerPush.authenticator = CBLAuthenticator.basicAuthenticatorWithNamePassword(user, password);
    };
    ReplicationPush.prototype.restart = function () {
        this.innerPush.restart();
    };
    ReplicationPush.prototype.start = function () {
        this.innerPush.start();
    };
    ReplicationPush.prototype.stop = function () {
        this.innerPush.stop();
    };
    ReplicationPush.prototype.setFilter = function (filter) {
        this.innerPush.filter = filter;
    };
    ReplicationPush.prototype.setFilterParams = function (params) {
        this.innerPush.filterParams = this.mapper.toObjcSafe(params);
    };
    return ReplicationPush;
}(Replication));
exports.ReplicationPush = ReplicationPush;
var Emitter = (function () {
    function Emitter(innerEmitter, mapper) {
        this.innerEmitter = innerEmitter;
        this.mapper = mapper;
        this.mapper.jsDateToTime = true;
    }
    Emitter.prototype.emit = function (key, value) {
        this.innerEmitter(this.mapper.toObjcSafe(key), this.mapper.toObjcSafe(value));
    };
    return Emitter;
}());
exports.Emitter = Emitter;
var AttachmentDefault = (function () {
    function AttachmentDefault(atachment) {
        this.atachment = atachment;
    }
    AttachmentDefault.prototype.getName = function () {
        return this.atachment.name;
    };
    AttachmentDefault.prototype.getType = function () {
        return this.atachment.contentType;
    };
    AttachmentDefault.prototype.getStream = function () {
        return this.atachment.content;
    };
    return AttachmentDefault;
}());
exports.AttachmentDefault = AttachmentDefault;
var AttachmentFactory = (function () {
    function AttachmentFactory() {
    }
    AttachmentFactory.fromSource = function (source, name, type) {
        var ad = source.ios;
        var data = null;
        switch (type) {
            case def.AttachmentImage.JPG:
                data = UIImageJPEGRepresentation(ad, 1);
                break;
            case def.AttachmentImage.PNG:
                data = UIImagePNGRepresentation(ad);
                break;
        }
        return {
            getName: function () {
                return name;
            },
            getStream: function () {
                return data;
            },
            getType: function () {
                return type == def.AttachmentImage.PNG ? "image/png" : "image/jpeg";
            }
        };
    };
    return AttachmentFactory;
}());
exports.AttachmentFactory = AttachmentFactory;
