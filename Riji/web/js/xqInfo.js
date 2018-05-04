
LZR.load([
	"LZR.Base.Json",
	"LZR.HTML.Base.Ajax",
	"LZR.Base.Time",
	"LZR.HTML.Util.Url"
]);

var timtmp = new Date();	// 时间缓存
var utTim = LZR.getSingleton(LZR.Base.Time);
var utJson = LZR.getSingleton(LZR.Base.Json);
var utUrl = LZR.getSingleton(LZR.HTML.Util.Url);
var ajx = new LZR.HTML.Base.Ajax ();

var dat = {
	hdDat: function (txt, sta) {
		if (sta === 200) {
			var d = utJson.toObj(txt);
			if (d.ok) {
				dat.show(d.dat[0]);
			}
		}
	},

	show: function (o) {
		var i, d, m;
		namDoe.innerHTML = o.nam;
		yearDoe.innerHTML = o.year + " 年";
		zoDoe.innerHTML = o.zo;
		opDoe.innerHTML = o.op;
		jobDoe.innerHTML = o.job;
		timDoe.innerHTML = o.metotal + " 次";

		if (o.tel) {
			for (i = 0; i < o.tel.length; i ++) {
				if (i) {
					telDoe.innerHTML += "<br />";
				}
				telDoe.innerHTML += o.tel[i];
			}
		}

		m = o.meet;
		for (i = 0; i < m.length; i ++) {
			if (m[i].txtim) {
				d = document.createElement("a");
				d.href = "xqOne.html?od=" + o.order + "&id=" + i;
				d.className = "tim";
			} else {
				d = document.createElement("span");
				d.className = "tim nolink";
			}
			timtmp.setTime(utTim.parseDayTimestamp(m[i].tim));
			d.innerHTML = utTim.format(timtmp, "date2");
			tbs.appendChild(d);
		}
	}
};

function init() {
	lzr_tools.getDomains("io_xq");

	var r = utUrl.getRequest();
	if (r.id) {
		ajx.evt.rsp.add(dat.hdDat);
		ajx.post("srvInfoXq/", {od: r.id}, null, true);
		lzr_tools.trace();
	}
}
