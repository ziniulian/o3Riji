// 日记模块

// 文件位置
var curPath = require.resolve("./index.js").replace("index.js", "");

// LZR 子模块加载
LZR.load([
	"LZR.Base.Time",
	"LZR.Node.Util",
	"LZR.Node.Db.Mongo",
	"LZR.Node.Db.NodeAjax"
]);

var utTim = LZR.getSingleton(LZR.Base.Time);
var utNode = LZR.getSingleton(LZR.Node.Util);

// 数据库
var mdb = new LZR.Node.Db.Mongo ({
	conf: process.env.OPENSHIFT_MONGODB_DB_URL ? process.env.OPENSHIFT_MONGODB_DB_URL : "mongodb://localhost:27017/test",
	// autoErr: true,
	hd_sqls: {
		srvGetBlog: {
			db: "test",
			tnam: "blog",
			funs: {
				find: ["<0>", {"_id": 0, "tim": 1, "gistId": 1, "title": 1}],
				sort: [{"tim": "<1>"}],
				limit: ["<2>"],
				toArray: []
			}
		},
		srvSetBlog: {
			db: "test",
			tnam: "blog",
			funs: {
				insertOne: ["<0>"]
			}
		},
		srvBlogCount: {
			db: "test",
			tnam: "blog",
			funs: {
				count: []
			}
		},
		srvIpLog: {		// 访问记录
			db: "test",
			tnam: "vs",
			funs: {
				insertOne: [{"tim": "<0>", "url": "<1>", "ip": "<2>"}]
			}
		}
	}
});

mdb.evt.srvGetBlog.add(function (r, req, res, next) {
	res.send(r);
});

mdb.evt.srvBlogCount.add(function (r, req, res, next) {
	res.send(r.toString());
});

// Ajax
var ajax = new LZR.Node.Db.NodeAjax ({
	hd_sqls: {
		gistTxt: "https://gist.githubusercontent.com/ziniulian/<0>/raw/"
	}
});

ajax.evt.gistTxt.add(function (r, req, res, next) {
	req.qpobj = {
		txt: r
	};
	next();
});

// 创建路由
var r = new LZR.Node.Router ({
	path: curPath,
	hd_web: "web"
});
// var r = srv.ro;

// 返回 gist 文本信息
r.get("/gistTxt/:id", function (req, res, next) {
	mdb.qry("srvIpLog", req, res, next, [Date.now(), req.originalUrl, utNode.getClientIp(req)]);	// 记录访问IP
	ajax.qry("gistTxt", req, res, next, [req.params.id]);
});

// 获取总数
r.get("/srvBlogCount", function (req, res, next) {
	mdb.qry("srvBlogCount", req, res, next);
});

// 插入一笔信息
r.get("/srvSetBlog/:tim/:id/:title?", function (req, res, next) {
	var s = {
		tim: utTim.getDayTimestamp(req.params.tim + " 0:0"),
		gistId: req.params.id
	};
	if (isNaN(s.tim)) {
		res.send("提交失败，时间格式错误！");
	} else {
		var t = req.params.title;
		if (t) {
			s.title = t;
		}
		mdb.qry("srvSetBlog", req, res, next, [s]);
		res.send("OK!");
	}
});

// 获取信息
r.get("/srvGetBlog/:size?/:sort?/:top?/:max?/:min?", function (req, res, next) {
	var size = (req.params.size - 0) || 10;
	var sort = (req.params.sort - 0);
	var top = req.params.top ? (req.params.top - 0) : 0;
	var max = req.params.max ? (req.params.max - 0) : 0;
	var min = req.params.min ? (req.params.min - 0) : 0;
	var s;
	var r = {};
	if (sort > 0) {
		sort = 1;
		s = top || min;
		if (max) {
			r.tim = {
				"$lte": max,
				"$gte": s
			};
		} else {
			if (s) {
				r.tim = {
					"$gte": s
				};
			}
		}
	} else {
		sort = -1;
		s = top || max;
		if (min) {
			r.tim = {
				"$lte": s,
				"$gte": min
			};
		} else {
			if (s) {
				r.tim = {
					"$lte": s
				};
			}
		}
	}

	mdb.qry("srvGetBlog", req, res, next, [r, sort, size]);
});

// 初始化模板
r.initTmp();

module.exports = r;
