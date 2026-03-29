// 分类标签切换脚本
document.addEventListener('DOMContentLoaded', function() {
  console.log('Category tabs script starting...');

  const tabs = document.querySelectorAll('.category-tab');
  const sections = document.querySelectorAll('.category-section');

  console.log('Tabs found:', tabs.length);
  console.log('Sections found:', sections.length);

  if (!tabs.length || !sections.length) {
    console.warn('Category tabs: Required elements not found');
    return;
  }

  // 切换分类的函数
  function switchCategory(category) {
    // 更新标签页状态
    tabs.forEach(t => {
      if (t.dataset.category === category) {
        t.classList.add('active');
      } else {
        t.classList.remove('active');
      }
    });

    // 显示/隐藏分类内容
    if (category === 'all') {
      sections.forEach(s => s.classList.remove('hidden'));
    } else {
      sections.forEach(s => {
        if (s.dataset.category === category) {
          s.classList.remove('hidden');
        } else {
          s.classList.add('hidden');
        }
      });
    }
  }

  // 点击事件：切换分类并更新 URL
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const category = this.dataset.category;
      console.log('Tab clicked, category:', category);

      // 更新 URL hash
      if (category === 'all') {
        history.pushState(null, '', window.location.pathname);
      } else {
        history.pushState(null, '', '#' + encodeURIComponent(category));
      }

      switchCategory(category);
    });
  });

  // 页面加载时：根据 URL hash 激活对应分类
  function handleHash() {
    const hash = decodeURIComponent(window.location.hash.slice(1));
    console.log('Handling hash:', hash);

    if (hash) {
      // 检查是否有对应的分类标签
      const targetTab = document.querySelector('.category-tab[data-category="' + hash + '"]');
      if (targetTab) {
        switchCategory(hash);
        // 滚动到分类区域
        targetTab.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    }
    // 默认显示全部
    switchCategory('all');
  }

  // 监听 hash 变化（浏览器前进/后退）
  window.addEventListener('hashchange', handleHash);

  // 初始化
  handleHash();

  console.log('Category tabs script initialized successfully');
});
