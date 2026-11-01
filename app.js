/* 你好，AI！—— 儿童科普页交互脚本 */
(function () {
  'use strict';

  /* ============ 0. 探险解锁 ============ */
  var startBtn = document.getElementById('start-adventure');
  if (startBtn) {
    startBtn.addEventListener('click', function (e) {
      if (document.body.classList.contains('locked')) {
        e.preventDefault();
        document.body.classList.remove('locked');
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            document.getElementById('around').scrollIntoView({ behavior: 'smooth' });
          });
        });
      }
    });
  }

  /* ============ 1. 翻翻卡 ============ */
  document.querySelectorAll('.flip-card').forEach(function (card) {
    function toggle() { card.classList.toggle('flipped'); }
    card.addEventListener('click', toggle);
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });

  /* ============ 2. 超能力标签页 ============ */
  var tabBtns = document.querySelectorAll('#power-tabs .tab-btn');
  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      tabBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      document.querySelectorAll('.tab-panel').forEach(function (p) {
        p.classList.toggle('show', p.getAttribute('data-panel') === btn.getAttribute('data-tab'));
      });
    });
  });

  /* ============ 3. 手风琴 ============ */
  document.querySelectorAll('.acc-item').forEach(function (item) {
    var head = item.querySelector('.acc-head');
    var body = item.querySelector('.acc-body');
    head.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.acc-item.open').forEach(function (o) {
        o.classList.remove('open');
        o.querySelector('.acc-body').style.maxHeight = '0';
      });
      if (!isOpen) {
        item.classList.add('open');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });

  /* ============ 4. AI 训练舱 ============ */
  // 水果 SVG（不同形状 + 颜色）
  function appleSVG(color) {
    return '<svg viewBox="0 0 24 24"><path d="M12 7c-4-2.5-8 .5-8 5 0 4.5 3.5 9 5.5 9 1.2 0 1.6-.6 2.5-.6s1.3.6 2.5.6c2 0 5.5-4.5 5.5-9 0-4.5-4-7.5-8-5z" fill="' + color + '"/><path d="M12 7c0-2 1-3.5 3-4" stroke="#8B5E3C" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M12 5c1.5-1.8 3.8-1.6 5 0-1.7 1.2-3.7 1-5 0z" fill="#7BC96F"/></svg>';
  }
  function bananaSVG() {
    return '<svg viewBox="0 0 24 24"><path d="M5 5c-1.5 8 4 14 12 14 1.8 0 3-.3 3-.8s-.7-.8-1.4-1.3C14 13.6 10 10.6 8.4 5.6 8 4.4 7.6 3.6 7 3.6 6 3.6 5.3 4.3 5 5z" fill="#FFC53D"/><path d="M7 3.6c.3-.6 1.2-.6 1.5 0l-.4 1.4H7.4z" fill="#8B5E3C"/></svg>';
  }
  function lemonSVG() {
    return '<svg viewBox="0 0 24 24"><path d="M3.5 12c0-1 1.5-1.6 2.2-2.4C6.6 8.6 7 5 12 5s5.4 3.6 6.3 4.6c.7.8 2.2 1.4 2.2 2.4s-1.5 1.6-2.2 2.4C17.4 15.4 17 19 12 19s-5.4-3.6-6.3-4.6C5 13.6 3.5 13 3.5 12z" fill="#FFD93B"/><path d="M9 9.5c.8-.8 2-1.2 3-1" stroke="#F0B429" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>';
  }
  function chiliSVG() {
    return '<svg viewBox="0 0 24 24"><path d="M8 7c6 0 11 4 11 10 0 1.5-1 2.5-2 2.5-1.2 0-1.5-1-2.3-2C12.6 15 9 13 7.5 9.5 7 8.3 7.4 7 8 7z" fill="#E8483F"/><path d="M8 7c-.5-1.5 0-3 2-3.5" stroke="#4C9A2A" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>';
  }

  var COLOR_NAME = { red: '红色', yellow: '黄色', green: '绿色' };
  var SHAPE_NAME = { round: '圆形', long: '长条形' };

  // 考试题库：answer=null 表示"超纲题"（特征组合 AI 没见过或会混淆）
  var TESTS = [
    { svg: appleSVG('#FF6B6B'), color: 'red', shape: 'round', answer: 'apple', name: '红苹果' },
    { svg: bananaSVG(), color: 'yellow', shape: 'long', answer: 'banana', name: '香蕉' },
    { svg: appleSVG('#7BC96F'), color: 'green', shape: 'round', answer: 'apple', name: '青苹果' },
    { svg: lemonSVG(), color: 'yellow', shape: 'round', answer: null, name: '柠檬' },
    { svg: chiliSVG(), color: 'red', shape: 'long', answer: null, name: '红辣椒' }
  ];

  var trained = { apple: [], banana: [] };
  var game = { score: 0, streak: 0, rounds: 0 };
  var testing = false;
  var lastTest = null;

  var el = {
    countApple: document.getElementById('count-apple'),
    countBanana: document.getElementById('count-banana'),
    dotsApple: document.getElementById('dots-apple'),
    dotsBanana: document.getElementById('dots-banana'),
    levelFill: document.getElementById('level-fill'),
    levelText: document.getElementById('level-text'),
    testBtn: document.getElementById('test-ai'),
    core: document.getElementById('brain'),
    corePanel: document.getElementById('core-panel'),
    speech: document.getElementById('brain-speech'),
    scanner: document.getElementById('scanner'),
    confNum: document.getElementById('conf-num'),
    confFill: document.getElementById('conf-fill'),
    score: document.getElementById('score'),
    streak: document.getElementById('streak'),
    rounds: document.getElementById('rounds')
  };

  var LEVELS = [
    { min: 0, label: 'LV.0 未启蒙' },
    { min: 1, label: 'LV.1 见习学员' },
    { min: 4, label: 'LV.2 小学徒' },
    { min: 7, label: 'LV.3 熟练训练师' },
    { min: 10, label: 'LV.4 AI 大师' }
  ];

  function speak(text) { el.speech.textContent = text; }

  function setConf(pct) {
    el.confFill.style.width = pct + '%';
    el.confNum.textContent = pct + '%';
  }

  function updateHUD() {
    var total = trained.apple.length + trained.banana.length;
    el.countApple.textContent = trained.apple.length;
    el.countBanana.textContent = trained.banana.length;
    el.dotsApple.innerHTML = new Array(trained.apple.length + 1).join('<i></i>');
    el.dotsBanana.innerHTML = new Array(trained.banana.length + 1).join('<i></i>');
    var lv = LEVELS[0];
    LEVELS.forEach(function (l) { if (total >= l.min) lv = l; });
    el.levelFill.style.width = Math.min(total / 10, 1) * 100 + '%';
    el.levelText.textContent = lv.label;
    el.testBtn.disabled = !(trained.apple.length >= 2 && trained.banana.length >= 2) || testing;
    el.core.classList.toggle('awake', total > 0);
    el.score.textContent = game.score;
    el.streak.textContent = game.streak;
    el.rounds.textContent = game.rounds;
  }

  // 投喂飞行动画：从按钮飞到 AI 核心
  function flyChip(fromEl, svg) {
    var from = fromEl.getBoundingClientRect();
    var to = el.core.getBoundingClientRect();
    var chip = document.createElement('div');
    chip.className = 'fly-chip';
    chip.innerHTML = svg;
    chip.style.left = (from.left + from.width / 2 - 17) + 'px';
    chip.style.top = (from.top + from.height / 2 - 17) + 'px';
    document.body.appendChild(chip);
    requestAnimationFrame(function () {
      var dx = (to.left + to.width / 2) - (from.left + from.width / 2);
      var dy = (to.top + to.height / 2) - (from.top + from.height / 2);
      chip.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(0.4)';
      chip.style.opacity = '0';
    });
    setTimeout(function () { chip.remove(); }, 650);
  }

  function confetti() {
    var colors = ['#FF6B6B', '#2BB3A3', '#FFB830', '#5fd4c6', '#ffffff'];
    for (var i = 0; i < 16; i++) {
      var p = document.createElement('i');
      p.className = 'confetti-piece';
      p.style.left = '50%';
      p.style.top = '40%';
      p.style.background = colors[i % colors.length];
      p.style.setProperty('--dx', (Math.random() * 220 - 110) + 'px');
      p.style.setProperty('--dy', (Math.random() * -160 - 20) + 'px');
      p.style.setProperty('--rot', (Math.random() * 540 - 270) + 'deg');
      el.corePanel.appendChild(p);
      (function (node) { setTimeout(function () { node.remove(); }, 1350); })(p);
    }
  }

  function feed(kind, btn) {
    if (testing) return;
    var f = kind === 'apple'
      ? { color: 'red', shape: 'round', svg: appleSVG('#FF6B6B'), name: '苹果' }
      : { color: 'yellow', shape: 'long', svg: bananaSVG(), name: '香蕉' };
    flyChip(btn, f.svg);
    setTimeout(function () {
      trained[kind].push({ color: f.color, shape: f.shape });
      updateHUD();
      speak('已记录特征：' + COLOR_NAME[f.color] + ' + ' + SHAPE_NAME[f.shape] + ' → ' + f.name);
      setConf(Math.min(20 + (trained.apple.length + trained.banana.length) * 6, 70));
    }, 500);
  }

  document.getElementById('feed-apple').addEventListener('click', function () { feed('apple', this); });
  document.getElementById('feed-banana').addEventListener('click', function () { feed('banana', this); });

  el.testBtn.addEventListener('click', function () {
    if (testing) return;
    testing = true;
    updateHUD();

    var item;
    do { item = TESTS[Math.floor(Math.random() * TESTS.length)]; } while (item === lastTest);
    lastTest = item;

    // 扫描阶段
    el.scanner.classList.add('scanning');
    el.core.classList.add('thinking');
    el.scanner.querySelector('.scan-q').style.display = '';
    var oldSVG = el.scanner.querySelector('svg');
    if (oldSVG) oldSVG.remove();
    speak('收到神秘样本，正在扫描……');
    setConf(50);

    setTimeout(function () {
      // 显示神秘水果
      el.scanner.classList.remove('scanning');
      el.scanner.querySelector('.scan-q').style.display = 'none';
      el.scanner.insertAdjacentHTML('beforeend', item.svg);
      speak('特征提取中：颜色 + 形状……');
    }, 1200);

    setTimeout(function () {
      el.core.classList.remove('thinking');
      game.rounds++;

      function score(list) {
        var s = 0;
        list.forEach(function (ex) {
          if (ex.color === item.color) s++;
          if (ex.shape === item.shape) s++;
        });
        return s / (list.length * 2);
      }
      var sa = score(trained.apple);
      var sb = score(trained.banana);

      if (sa === 0 && sb === 0) {
        game.streak = 0;
        speak('它的特征我从来没见过……数据太少了，再喂点例子吧！');
        setConf(5);
      } else if (sa === sb) {
        game.streak = 0;
        speak('这是' + item.name + '！可它既像苹果又像香蕉，我分不清了——需要更多不一样的例子。');
        setConf(45);
      } else {
        var guessApple = sa > sb;
        var conf = Math.round(50 + Math.max(sa, sb) * 50);
        var hit = (guessApple && item.answer === 'apple') || (!guessApple && item.answer === 'banana');
        if (hit) {
          game.streak++;
          game.score += 10 + (game.streak - 1) * 5;
          speak('识别为「' + (guessApple ? '苹果' : '香蕉') + '」——正确，是' + item.name + '！+' + (10 + (game.streak - 1) * 5) + ' 分' + (game.streak >= 2 ? '，连胜 x' + game.streak : ''));
          confetti();
        } else {
          game.streak = 0;
          speak('我猜是「' + (guessApple ? '苹果' : '香蕉') + '」……错了，这是' + item.name + '！它和我学的不太一样，我还需要继续学习。');
        }
        setConf(conf);
      }
      testing = false;
      updateHUD();
    }, 2400);
  });

  document.getElementById('reset-lab').addEventListener('click', function () {
    trained = { apple: [], banana: [] };
    game = { score: 0, streak: 0, rounds: 0 };
    lastTest = null;
    testing = false;
    el.scanner.classList.remove('scanning');
    el.core.classList.remove('thinking');
    var oldSVG = el.scanner.querySelector('svg');
    if (oldSVG) oldSVG.remove();
    el.scanner.querySelector('.scan-q').style.display = '';
    setConf(0);
    speak('记忆已清空，请重新投喂数据。');
    updateHUD();
  });
  updateHUD();

  /* ============ 5. 神经网络信号动画 ============ */
  var layers = [
    { x: 90, ys: [60, 150, 240] },
    { x: 320, ys: [40, 110, 180, 250] },
    { x: 550, ys: [90, 210] }
  ];
  var svgNS = 'http://www.w3.org/2000/svg';
  var gEdges = document.getElementById('nn-edges');
  var gNodes = document.getElementById('nn-nodes');
  var edgeEls = [[], []];
  var nodeEls = [[], [], []];

  for (var l = 0; l < 2; l++) {
    layers[l].ys.forEach(function (y1) {
      layers[l + 1].ys.forEach(function (y2) {
        var line = document.createElementNS(svgNS, 'line');
        line.setAttribute('x1', layers[l].x);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', layers[l + 1].x);
        line.setAttribute('y2', y2);
        line.setAttribute('class', 'nn-edge');
        gEdges.appendChild(line);
        edgeEls[l].push(line);
      });
    });
  }
  layers.forEach(function (layer, li) {
    layer.ys.forEach(function (y) {
      var c = document.createElementNS(svgNS, 'circle');
      c.setAttribute('cx', layer.x);
      c.setAttribute('cy', y);
      c.setAttribute('r', 18);
      c.setAttribute('class', 'nn-node');
      gNodes.appendChild(c);
      nodeEls[li].push(c);
    });
  });

  var nnMsg = document.getElementById('nn-msg');
  var nnRunning = false;
  document.getElementById('nn-run').addEventListener('click', function () {
    if (nnRunning) return;
    nnRunning = true;
    nnMsg.textContent = '';
    function clearAll() {
      nodeEls.forEach(function (layer) { layer.forEach(function (n) { n.classList.remove('lit'); }); });
      edgeEls.forEach(function (group) { group.forEach(function (e) { e.classList.remove('lit'); }); });
    }
    clearAll();
    setTimeout(function () {
      nodeEls[0].forEach(function (n) { n.classList.add('lit'); });
      nnMsg.textContent = '第 1 步：眼睛把看到的信息传进来……';
    }, 100);
    setTimeout(function () {
      edgeEls[0].forEach(function (e) { e.classList.add('lit'); });
      nodeEls[1].forEach(function (n) { n.classList.add('lit'); });
      nnMsg.textContent = '第 2 步：中间的"小灯泡"一起动脑筋找规律……';
    }, 900);
    setTimeout(function () {
      edgeEls[1].forEach(function (e) { e.classList.add('lit'); });
      nodeEls[2].forEach(function (n) { n.classList.add('lit'); });
      nnMsg.textContent = '第 3 步：答案出来啦——"这是一只猫！"';
    }, 1700);
    setTimeout(function () { clearAll(); nnRunning = false; }, 3600);
  });

  /* ============ 6. 小测验 ============ */
  var QUIZ = [
    {
      q: '人工智能（AI）是指什么？',
      opts: ['会魔法的机器人', '让电脑像人一样学习和思考的技术', '一种很好玩的电子游戏'],
      answer: 1,
      why: '答对啦！AI 就是让电脑像人一样学习、思考的技术。'
    },
    {
      q: 'AI 是怎么学会认猫的？',
      opts: ['科学家给它背了一段"猫的定义"', '它天生就会', '看了成千上万张猫的照片，自己找规律'],
      answer: 2,
      why: '没错！就像你看了很多猫之后自然认识猫一样，AI 也是从大量例子中找规律。'
    },
    {
      q: '下面哪个是 AI 的"食物"？',
      opts: ['电池', '数据（照片、声音、文字）', '巧克力'],
      answer: 1,
      why: '对啦！数据就是 AI 的"食物"，吃得越多越健康，本领就越大。'
    },
    {
      q: '关于 AI，下面哪个说法是对的？',
      opts: ['AI 什么都会，从不出错', 'AI 也会犯错，答案要再检查', 'AI 和人一样有真正的感情'],
      answer: 1,
      why: '是的！AI 学的例子不够就会犯错，所以重要的事要再核实。'
    },
    {
      q: '使用 AI 时，我们应该怎么做？',
      opts: ['把家庭住址告诉聊天机器人', '让 AI 替我写作业', '保护隐私，用 AI 帮助学习和创造'],
      answer: 2,
      why: '太棒了！保护隐私、善用 AI，你已经是聪明的 AI 小主人了！'
    }
  ];
  var qi = 0, qScore = 0;
  var qArea = document.getElementById('quiz-area');
  var qQ = document.getElementById('quiz-q');
  var qOpts = document.getElementById('quiz-opts');
  var qFb = document.getElementById('quiz-feedback');
  var qProgress = document.getElementById('quiz-progress');
  var qScoreBox = document.getElementById('quiz-score');

  function renderProgress() {
    qProgress.innerHTML = '';
    for (var i = 0; i < QUIZ.length; i++) {
      var d = document.createElement('span');
      d.className = 'quiz-dot' + (i < qi ? ' done' : (i === qi ? ' now' : ''));
      qProgress.appendChild(d);
    }
  }

  function renderQ() {
    renderProgress();
    var item = QUIZ[qi];
    qQ.textContent = '第 ' + (qi + 1) + ' 题：' + item.q;
    qFb.textContent = '';
    qFb.style.color = '';
    qOpts.innerHTML = '';
    item.opts.forEach(function (opt, idx) {
      var b = document.createElement('button');
      b.className = 'quiz-opt';
      b.textContent = opt;
      b.addEventListener('click', function () {
        var correct = idx === item.answer;
        if (correct) { qScore++; b.classList.add('correct'); }
        else {
          b.classList.add('wrong');
          qOpts.children[item.answer].classList.add('correct');
        }
        Array.prototype.forEach.call(qOpts.children, function (c) { c.disabled = true; });
        qFb.style.color = correct ? 'var(--accent2)' : 'var(--accent)';
        qFb.textContent = correct ? '回答正确！' + item.why : '再想想——' + item.why;
        setTimeout(function () {
          qi++;
          if (qi < QUIZ.length) renderQ();
          else showScore();
        }, 1600);
      });
      qOpts.appendChild(b);
    });
  }

  function showScore() {
    qArea.style.display = 'none';
    qProgress.style.display = 'none';
    qScoreBox.style.display = 'block';
    document.getElementById('quiz-score-text').textContent = qScore + ' / ' + QUIZ.length;
    var comment;
    if (qScore === QUIZ.length) { comment = '满分！恭喜你成为"AI 小小科学家"！'; }
    else if (qScore >= 3) { comment = '很棒！再复习一下错的地方，下次冲击满分！'; }
    else { comment = '别灰心，回到上面再读一读，你一定能行！'; }
    document.getElementById('quiz-comment').textContent = comment;
  }

  document.getElementById('quiz-retry').addEventListener('click', function () {
    qi = 0; qScore = 0;
    qScoreBox.style.display = 'none';
    qArea.style.display = 'block';
    qProgress.style.display = 'flex';
    renderQ();
  });
  renderQ();

  /* ============ 7. 滚动出现动画 ============ */
  var revealEls = document.querySelectorAll('section .card, .flip-card, .step, .link-card');
  revealEls.forEach(function (el) { el.classList.add('reveal'); });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(function (el) { io.observe(el); });
})();
