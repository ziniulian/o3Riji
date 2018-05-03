
LZR.load([
	"LZR.HTML.Srv.ComDbQry",
	"LZR.Base.Time",
	"LZR.HTML.Util.Url"
]);

var timtmp = new Date();	// 时间缓存
var utTim = LZR.getSingleton(LZR.Base.Time);
var utUrl = LZR.getSingleton(LZR.HTML.Util.Url);

var dat = {
	od: false,
	mts: [],
	tmp: false,

	// 数据库访问工具
	db: new LZR.HTML.Srv.ComDbQry ({
		custExe: true,
		url: {
			add: "srvAddMeetXq/",
			del: "srvDelMeetXq/",
			set: "srvSetMeetXq/",
			meg: "srvOneMeetXq/",
			get: "srvInfoXq3/"
		}
	}),

	// 数据库初始化
	initDb: function () {
		dat.db.mark.doe = document.getElementById("mark");
		dat.db.memo.doe = document.getElementById("logDoe");
		dat.db.evt.getr.add(function (o) {
			namDoe.innerHTML = o[0].nam;
			namDoe.href = "xqBaseMgr.html?od=" + dat.od;
			var d = o[0].meet;
			for (var i = 0; i < d.length; i ++) {
				meetDoe.appendChild(dat.crtObj(d[i], i).doe);
			}
		});
		dat.db.evt.exer.add(function (o) {
			if (o.ok) {
				switch (dat.db.busy) {
					case "meg":
						dat.tmp.txt = o.dat.meet.txt;
						txtDoe.value = dat.tmp.txt;
						break;
					case "add":
						dat.crtObj(dat.tmp);
						delDoe.className = "";
						dat.mts.sort(dat.sortfun);
						dat.tmp.id = dat.getId(dat.tmp.tim);
						var id = dat.tmp.id + 1;
						if (id === dat.mts.length) {
							meetDoe.appendChild(dat.tmp.doe);
						} else {
							meetDoe.insertBefore(dat.tmp.doe, dat.mts[id].doe);
						}
						dat.db.showMsg("添加成功！");
						break;
					case "del":
						txtDoe.value = "";
						txtimDoe.value = "";
						delDoe.className = "Lc_nosee";
						meetDoe.removeChild(dat.tmp.doe);
						dat.mts.splice(dat.tmp.id, 1);
						dat.tmp = dat.tmp.tim;
						dat.db.showMsg("删除成功！");
						break;
					case "set":
						if (txtDoe.value) {
							dat.tmp.txt = txtDoe.value;
							dat.tmp.txtim = utTim.getDayTimestamp(txtimDoe.value);
							if (txtimDoe.value) {
								dat.tmp.strTxtim = txtimDoe.value;
							} else {
								timtmp.setTime(utTim.parseDayTimestamp(dat.tmp.txtim));
								dat.tmp.strTxtim = utTim.format(timtmp, "date2");
								txtimDoe.value = dat.tmp.strTxtim;
							}
						} else {
							LZR.del(dat.tmp, "txt");
							LZR.del(dat.tmp, "txtim");
							LZR.del(dat.tmp, "strTxtim");
							txtimDoe.value = "";
						}
						dat.db.showMsg("修改成功！");
						break;
				}
			} else {
				switch (dat.db.busy) {
					case "add":
						dat.tmp = dat.tmp.tim;
						dat.db.showMsg("添加失败！");
						break;
					case "del":
						dat.db.showMsg("删除失败！");
						break;
					case "set":
						dat.db.showMsg("修改失败！");
						break;
				}
			}
			dat.db.showMark(false);
		});
	},

	// 获取序号
	getId: function (t) {
		for (var i = 0; i < dat.mts.length; i ++) {
			if (dat.mts[i].tim === t) {
				return i;
			}
		}
		return -1;
	},

	// 排序规则
	sortfun: function (a, b) {
		if (a.tim > b.tim) {
			return 1;
		} else {
			return 0;
		}
	},

	// 创建对象
	crtObj: function (o) {
		var t = o.tim;
		var id = dat.getId(t);
		if (id === -1) {
			timtmp.setTime(utTim.parseDayTimestamp(t));
			o.strTim = utTim.format(timtmp, "date2");
			if (o.txtim) {
				timtmp.setTime(utTim.parseDayTimestamp(o.txtim));
				o.strTxtim = utTim.format(timtmp, "date2");
			}
			o.doe = document.createElement("a");
			o.doe.innerHTML = o.strTim;
			o.doe.href = "javascript: dat.timchg(" + t + ");"
			dat.mts.push(o);
			return o;
		} else {
			return dat.mts[id];
		}
	},

	// 时间变化响应
	timchg: function (t) {
		dat.tmp = false;
		txtDoe.value = "";
		txtimDoe.value = "";
		delDoe.className = "Lc_nosee";
		if (!t) {
			if (timDoe.value) {
				t = utTim.getDayTimestamp(timDoe.value);
				dat.tmp = t;
			}
		}
		if (t) {
			var id = dat.getId(t);
			if (id !== -1) {
				var o = dat.mts[id];
				o.id = id;
				dat.tmp = o;
				delDoe.className = "";
				timDoe.value = o.strTim;
				if (o.txtim) {
					txtimDoe.value = o.strTxtim;
					if (o.txt) {
						txtDoe.value = o.txt;
					} else {
						dat.db.meg({
							od: dat.od,
							id: id
						});
					}
				}
			} else if (dat.tmp !== t) {
				dat.tmp = t;
				timtmp.setTime(utTim.parseDayTimestamp(t));
				timDoe.value = utTim.format(timtmp, "date2");
			}
		}
	},

	// 新增或修改
	sav: function () {
		if (dat.tmp) {
			var o = {
				od: dat.od
			};
			if (txtDoe.value) {
				o.txt = txtDoe.value;
				o.txtim = utTim.getDayTimestamp(txtimDoe.value);
			}
			if (dat.tmp.tim) {
				// 修改
				o.tim = dat.tmp.tim;
				if (!o.txtim) {
					o.txtim = "N";	// 清空内容
				}
				dat.db.set(o);
			} else {
				// 新增
				o.tim = dat.tmp;
				dat.tmp = o;
				dat.db.add(o);
			}
		}
	},

	// 删除
	del: function () {
		if (dat.tmp) {
			dat.db.del({
				od: dat.od,
				tim: dat.tmp.tim
			});
		}
	}
};

function init() {
	var r = utUrl.getRequest();
	dat.initDb();
	if (r.od) {
		dat.od = r.od;
		dat.db.get(r);
		lzr_tools.trace();
	}
}
