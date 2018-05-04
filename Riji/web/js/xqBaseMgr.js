
LZR.load([
	"LZR.HTML.Srv.ComDbQry",
	"LZR.HTML.Util.Url"
]);

var utUrl = LZR.getSingleton(LZR.HTML.Util.Url);

var dat = {
	od: false,

	// 数据库访问工具
	db: new LZR.HTML.Srv.ComDbQry ({
		custExe: true,
		url: {
			meg: "srvSetBaseXq/",
			get: "srvInfoXq2/"
		}
	}),

	// 数据库初始化
	initDb: function () {
		dat.db.mark.doe = document.getElementById("mark");
		dat.db.memo.doe = document.getElementById("logDoe");
		dat.db.evt.getr.add(function (o) {
			dat.show(o[0]);
		});
		dat.db.evt.exer.add(function (o) {
			if (o.ok) {
				if (dat.od) {
					dat.db.showMsg("修改成功！");
				} else {
					location.href = "xqMgr.html";
				}
			} else {
				dat.db.showMsg("提交失败！");
			}
			dat.db.showMark(false);
		});
	},

	show: function (o) {
		namDoe.value = o.nam;
		yearDoe.value = o.year;
		zoDoe.value = o.zo;
		opDoe.value = o.op;
		jobDoe.value = o.job;

		dat.od = o.order;
		meetDoe.href = "xqMeetMgr.html?od=" + o.order;

		if (o.tel) {
			var s = o.tel[0];
			for (var i = 1; i < o.tel.length; i ++) {
				s += "\n";
				s += o.tel[i];
			}
			telDoe.value = s;
		}
	},

	sav: function () {
		dat.db.meg({
			od: dat.od,
			nam: namDoe.value,
			year: yearDoe.value,
			zo: zoDoe.value,
			op: opDoe.value,
			job: jobDoe.value,
			tel: telDoe.value
		});
	}
};

function init() {
	lzr_tools.getDomains("io_xq_mgr");

	var r = utUrl.getRequest();
	dat.initDb();
	if (r.od) {
		dat.db.get(r);
	}
	lzr_tools.trace();
}
