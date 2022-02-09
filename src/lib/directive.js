/**
 * 创建一个scroller的dom
 */
import { throttle } from 'lodash'
class Scroller {
  /**
   * 给tableBody创建一个scroller
   * @param {Element} targetTableEl
   */
  constructor (targetTableEl) {
    if (!targetTableEl) {
      throw new Error('need have table element')
    }
    this.targetTableEl = targetTableEl

    /**
     * 创建相关dom
     */
    const scroller = document.createElement('div')
    scroller.classList.add('el-scrollbar')
    scroller.style.height = '8px'
    scroller.style.position = 'fixed'
    scroller.style.bottom = 0
    scroller.style.zIndex = 3

    this.dom = scroller
    this.resetScroller()

    const bar = document.createElement('div')
    bar.classList.add('el-scrollbar__bar', 'is-horizontal')
    this.bar = bar
    scroller.appendChild(bar)

    const thumb = document.createElement('div')
    thumb.classList.add('el-scrollbar__thumb')
    bar.appendChild(thumb)
    this.thumb = thumb

    /**
     * 初始化配置
     */
    const instance = this
    this.checkIsScrollBottom = throttle(function () {
      const viewHeight = window.innerHeight || document.documentElement.clientHeight
      const { bottom } = targetTableEl.getBoundingClientRect()
      if (bottom <= viewHeight) {
        instance.hideScroller()
      } else {
        instance.showScroller()
      }
    }
    , 1000 / 60)
    document.addEventListener('scroll', this.checkIsScrollBottom) // 全局判断是否需要显示scroller

    // 自动同步,table => thumb
    targetTableEl.addEventListener('scroll', throttle(function () {
      instance.thumb.style.transform = `translateX(${instance.moveX}%)`
    }, 1000 / 60))

    // 监听table的dom变化，自动重新设置
    this.tableElObserver = new MutationObserver(function () {
      setTimeout(() => {
        instance.resetBar()
        instance.resetScroller()
      })
    })
    this.tableElObserver.observe(targetTableEl, {
      attributeFilter: ['style']
    })
    // bar宽度自动重制
    setTimeout(() => {
      this.resetBar()
    }, 0)
  }

  /**
   * 自动设置Bar
   */
  resetBar () {
    const { targetTableEl } = this
    const widthPercentage = (targetTableEl.clientWidth * 100 / targetTableEl.scrollWidth)
    const thumbWidth = Math.min(widthPercentage, 100)
    this.thumb.style.width = `${thumbWidth}%`
  }

  resetScroller () {
    const { targetTableEl, dom } = this
    const boundingClientRect = targetTableEl.getBoundingClientRect()
    dom.style.left = boundingClientRect.left + 'px'
    dom.style.width = boundingClientRect.width + 'px'
  }

  get moveX () {
    const { targetTableEl } = this
    return ((targetTableEl.scrollLeft * 100) / targetTableEl.clientWidth)
  }

  /**
   * 显示整体
   */
  showScroller () {
    this.dom.style.display = 'initial'
  }

  /**
   * 隐藏整体
   */
  hideScroller () {
    this.dom.style.display = 'none'
  }

  /**
   * 显示滚动条
   */
  showBar () {
    this.bar.style.opacity = 1
  }

  /**
   * 隐藏滚动条
   */
  hideBar () {
    this.bar.style.opacity = 0
  }

  destory () {
    this.tableElObserver.disconnect()
    document.removeEventListener('scroll', this.checkIsScrollBottom)
  }
}

/** @type {Vue.DirectiveOptions} */
export const directive = {
  inserted (el, binding) {
    const tableBodyWrapper = el.querySelector('.el-table__body-wrapper')
    const scroller = new Scroller(tableBodyWrapper)
    el.appendChild(scroller.dom)
    el.horizontalScroll = scroller
    el.addEventListener('mouseover', scroller.showBar.bind(scroller))
    el.addEventListener('mouseleave', scroller.hideBar.bind(scroller))
  },
  unbind (el) {
    el.horizontalScroll.destory()
  }
}

/**
 * 插件
 * @type {VuePlugin}
 */
export const Plugin = {
  install (Vue) {
    Vue.directive('horizontalScroll', directive)
  }
}

export default Plugin
