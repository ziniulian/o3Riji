// 日记模块

// 文件位置
var curPath = require.resolve("./index.js").replace("index.js", "");

// LZR 子模块加载
LZR.load([
	"LZR.Base.Time",
	"LZR.Node.Db.Mongo"
]);

var utTim = LZR.getSingleton(LZR.Base.Time);

// 数据库
var mdb = new LZR.Node.Db.Mongo ({
	conf: process.env.OPENSHIFT_MONGODB_DB_URL || "mongodb://localhost:27017/test",
	autoErr: true,
	hd_sqls: {
		input: {
			tnam: "diary",
			funs: {
				insertMany: ["<0>"]
			}
		}
	}
});

mdb.evt.input.add(function (r, req, res, next) {
	res.json(r);
})

// 创建路由
var r = new LZR.Node.Router ({
	path: curPath,
	// hd_web: "web"
});

r.get("/srvInput", function (req, res, next) {
	var o = require("./xq.js");
	mdb.qry("input", req, res, next, [o]);
});

// 初始化模板
// r.initTmp();

module.exports = r;
