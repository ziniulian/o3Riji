LZR.load([
    "LZR.Base.Json",
    "LZR.Base.Data",
    "LZR.Base.Time",
    "LZR.Base.Val.Ctrl",
    "LZR.HTML.Base.Doe",
	"LZR.HTML.Base.Ajax",
    "LZR.HTML.Util.Url"
]);

// 数据
var dat = {
    size: 10,
    sort: -1,
    top: 0,
    count: 0,
    vym: null,  // 年模板
    vmm: null,  // 月模板
    vdm: null,  // 日模板
    pdoe: null, // 上一页
    ndoe: null, // 下一页
    ddoe: null, // 日列表容器
    y: new LZR.Base.Val.Ctrl (0),
    m: new LZR.Base.Val.Ctrl (0),
    p: new LZR.Base.Val.Ctrl (0),
    ys: null, // 年列表容器
}

var aj = new LZR.HTML.Base.Ajax ();
var utJson = LZR.getSingleton(LZR.Base.Json);
var utTim = LZR.getSingleton(LZR.Base.Time);
var utUrl = LZR.getSingleton(LZR.HTML.Util.Url);

// 生成年目录
function crtYs (y) {
    var v = crtY(1);
    v.total = aj.get("srvBlogCount/");
    v.getById("num").doe.innerHTML = "共 " + v.total + " 篇";
    v.dat = [];
    dat.ys.add(v, 1);

    if (dat.sort > 0) {
        for (var i = 2006; i <= y; i++) {
            dat.ys.add(crtY(i), i);
        }
    } else {
        for (y; y > 2005; y--) {
            dat.ys.add(crtY(y), y);
        }
    }
}

// 生成年
function crtY (y) {
    var r = dat.vym.clone();
    r.getById("txt").doe.innerHTML = (y === 1)?"全部":(y + " 年");
    dat.ys.add(r, y);
    r.getById("y").addEvt("click", function () {
        dat.y.set(y);
    });
    return r;
}

// 生成月目录
function crtMs (doe, dt) {
    var mp = 0;
    var d = new Date();
    var v;
    for (var i = 0; i < dt.length; i++) {
        d.setTime(utTim.parseDayTimestamp(dt[i].tim));
        var m = d.getMonth() + 1;
// console.log (m);
        if (m !== mp) {
            mp = m;
            if (v) {
                v.getById("num").doe.innerHTML = (v.pl - v.p) + " 篇";
            }
            v = crtM(doe, dt, m, i);
        }
        v.pl ++;
    }
    v.getById("num").doe.innerHTML = (v.pl - v.p) + " 篇";
}

// 生成月
function crtM (doe, dt, m, i) {
    var r = dat.vmm.clone();
    r.getById("txt").doe.innerHTML = m + "月";
    r.dat = dt;
    r.p = i;
    r.pl = i;
    r.addEvt("click", function () {
        dat.m.set(m);
    });
    doe.add(r, m);
    return r;
}

// 初始化元素模板
function initDoe () {
    dat.ys = new LZR.HTML.Base.Doe ({
        hd_doe: document.getElementById("yo")
    });
    dat.ddoe = new LZR.HTML.Base.Doe ({
        hd_doe: document.getElementById("do")
    });
    dat.pdoe = new LZR.HTML.Base.Doe ({
        hd_doe: document.getElementById("pre")
    });
    dat.ndoe = new LZR.HTML.Base.Doe ({
        hd_doe: document.getElementById("next")
    });
    dat.vym = dat.ys.del("ym");
    dat.vmm = dat.ys.del("mm");
    dat.vdm = dat.ddoe.del("dm");

    dat.pdoe.addEvt("click", function () {
        var p = dat.p.get();
        p -= dat.size;
        dat.p.set(p);
    });

    dat.ndoe.addEvt("click", function () {
        var p = dat.p.get();
        p += dat.size;
        dat.p.set(p);
    });
}

function init () {
    var y = new Date().getFullYear();
    var s = utUrl.getRequest().sort;
    var a = document.getElementById("sort");
    if (s && s == 1) {
        dat.sort = 1;
        a.href = "./";
    } else {
        a.href = "./?sort=1";
    }

    initDoe();
    crtYs(y);

// console.log (dat);
    dat.y.set(1);
}

dat.y.evt.change.add (function (v, s, o) {
    var d, dt;
// console.log (o + " --> " + v);

    // 调整样式
    if (o) {
        d = dat.ys.getById(o);
        dt = dat.m.get();
        if (dt) {
            d.getById(dt).delCss("msec");
            dat.m.set(0, false);
        }
        d.delCss("ysec");
        d.getById("m").addCss("nosee");
    }
    d = dat.ys.getById(v);
    d.addCss("ysec");

    // 获取数据
    if (v !== 1) {
        if (!d.dat) {
            var s = "srvGetBlog/400/" + dat.sort + "/0/" + utTim.dayAreaStamp(v, 0, 1) + "/" + utTim.dayAreaStamp(v);
// console.log (s);
            d.dat = utJson.toObj(aj.get(s));
// console.log (dt);
            d.getById("num").doe.innerHTML = d.dat.length + " 篇";
            if (d.dat.length) {
                dt = d.getById("m");
                dt.delCss("nosee");
                crtMs(dt, d.dat);
            }
        } else if (d.dat.length) {
            d.getById("m").delCss("nosee");
        }
    }
});

dat.y.evt.set.add (function (v) {
    // 月份清零
    dat.m.set(0);
});

dat.m.evt.change.add (function (v, s, o) {
    var d = dat.ys.getById(dat.y.get());
    if (o) {
        d.getById(o).delCss("msec");
    }
    if (v) {
        d.getById(v).addCss("msec");
    }
});

dat.m.evt.set.add (function (v) {
    // 重设指针
    dat.p.set(-1, false);
    dat.p.set(0);
});

dat.p.evt.change.add (function (v) {
    var y = dat.y.get();
    var m = dat.m.get();
    var d = dat.ys.getById(y);
    var n = v + dat.size;
    var p = v;
    var t = new Date();
    var max, vv, s;

    // 没有上一页按钮
    if (p === 0) {
        dat.pdoe.addCss("nosee");
    } else {
        dat.pdoe.delCss("nosee");
    }

    if (y === 1) {
        max = d.total;
        if (p > d.dat.length) {
            console.log ("Err: 指针越界！");
            dat.p.set(d.dat.length, false);
            p = d.dat.length;
        }
        if (p === d.dat.length) {
            s = "srvGetBlog/" + dat.size + "/" + dat.sort + "/";
            if (p === 0) {
                s += "0/";
            } else {
                s += (d.dat[p - 1].tim + dat.sort);
            }
// console.log (s);
            d.dat = d.dat.concat(utJson.toObj(aj.get(s)));
        }
    } else if (m) {
        d = d.getById(m);
        p += d.p;
        n += d.p;
        max = d.pl;
    } else {
        max = d.dat.length;
    }

    // 没有下一页按钮
    if (n >= max) {
        n = max;
        dat.ndoe.addCss("nosee");
    } else {
        dat.ndoe.delCss("nosee");
    }

    // 清空日记录
    dat.ddoe.delAll();

    // 生成日记录
    for (p; p < n; p++) {
        s = d.dat[p];
        vv = dat.vdm.clone();
        t.setTime(utTim.parseDayTimestamp(s.tim));
        vv.doe.href = "gistTxt/" + s.gistId;
        vv.doe.target = "_blank";
        vv.getById("tim").doe.innerHTML = t.getFullYear() + "-" + (t.getMonth() + 1) + "-" + t.getDate();
        if (s.title) {
            vv.getById("txt").doe.innerHTML = s.title;
        }
        dat.ddoe.add(vv, p);
    }
});
