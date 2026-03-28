// 博客视图切换脚本
document.addEventListener('DOMContentLoaded', function() {
  console.log('Blog view toggle script starting...');
  
  const buttons = document.querySelectorAll('.view-toggle-btn');
  const timelineView = document.getElementById('timeline-view');
  const categoryView = document.getElementById('category-view');

  console.log('Buttons found:', buttons.length);
  console.log('Timeline view:', timelineView);
  console.log('Category view:', categoryView);

  if (!buttons.length || !timelineView || !categoryView) {
    console.warn('Blog view toggle: Required elements not found');
    return;
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', function() {
      const view = this.dataset.view;
      console.log('Button clicked, view:', view);

      // 更新按钮状态
      buttons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      // 切换视图
      if (view === 'timeline') {
        timelineView.style.display = 'block';
        categoryView.style.display = 'none';
      } else {
        timelineView.style.display = 'none';
        categoryView.style.display = 'block';
      }
    });
  });
  
  console.log('Blog view toggle script initialized successfully');
});
