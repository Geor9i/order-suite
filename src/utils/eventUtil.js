export default class EventUtil {
  
    eventData(e) {
      const rect = (e.target).getBoundingClientRect();
      const { offsetX, offsetY, clientX, clientY } = e;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      return { rect, offsetX, offsetY, centerX, centerY, clientX, clientY };
    }
  
    resizeToScreen(widthPercentage, heightPercentage) {
      const { innerWidth, innerHeight } = window;
  
      let width = innerWidth * (widthPercentage / 100);
      let height = innerHeight * (heightPercentage / 100);
      return [width, height];
    }
  
    elementData(element) {
      const rect = element.getBoundingClientRect();
      const centerX = rect.x + rect.width / 2;
      const centerY = rect.y + rect.height / 2;
      return { rect, centerX, centerY };
    }
}