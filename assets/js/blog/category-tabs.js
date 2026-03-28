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

  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const category = this.dataset.category;
      console.log('Tab clicked, category:', category);

      // 更新标签页状态
      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');

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
    });
  });
  
  console.log('Category tabs script initialized successfully');
});
