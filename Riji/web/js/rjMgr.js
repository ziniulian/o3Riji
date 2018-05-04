
LZR.load([
	"LZR.HTML.Srv.ComDbQry",
	"LZR.Base.Time"
]);

var timtmp = new Date();	// 时间缓存
var utTim = LZR.getSingleton(LZR.Base.Time);
var dat = {

	// 数据库访问工具
	db: new LZR.HTML.Srv.ComDbQry ({
		sort: -1,
		custExe: true,
		keyNam: "tim",
		url: {
			meg: "srvMegRj/"
		}
	}),

	// 数据库初始化
	initDb: function () {
		dat.db.mark.doe = document.getElementById("mark");
		dat.db.evt.exer.add(function (o) {
			if (o.ok) {
				dat.memo("提交成功！");
				timDoe.value = "";
				titleDoe.value = "";
				txtDoe.value = "";
			} else {
				dat.memo("提交失败！");
			}
			dat.db.showMark(false);
		});
	},

	// 信息提示
	memo: function (msg) {
		logDoe.innerHTML = msg;
		setTimeout(function () {
			logDoe.innerHTML = "";
		}, 2000);
	},

	sub: function () {
		if (!timDoe.value) {
			dat.memo("没有日期！");
		} else if (!txtDoe.value) {
			dat.memo("没有内容！");
		} else {
			var o = {
				tim: utTim.getDayTimestamp(timDoe.value),
				txt: txtDoe.value
			}
			if (titleDoe.value) {
				o.title = titleDoe.value;
			}
			dat.db.meg(o);
		}
	}

};

function init() {
	lzr_tools.getDomains("io_rj");
	dat.initDb();
	lzr_tools.trace();
}
