import { ref, watch, onMounted } from 'vue'
import gsap from 'gsap'

export const useChatInfoAnimation = (chatInfoFolded: ReturnType<typeof ref<boolean>>) => {
  const playerCardRef = ref<HTMLDivElement | null>(null)
  const avatarContainerRef = ref(null)
  const avatarRef = ref(null)
  let animationTimeLine: GSAPTimeline; 

  const collapseCard = () => {
    animationTimeLine.play()
  }

  const unCollapseCard = () => {
    animationTimeLine.reverse()
  }

  const whichAnimationPlay = (state: boolean | undefined) => {
    if (state) {
      collapseCard()
    } else {
      unCollapseCard()
    }
  }

  watch(chatInfoFolded, (current) => {
    whichAnimationPlay(current)
  })
  onMounted(() => {
    animationTimeLine = gsap.timeline({ paused: true })
    animationTimeLine
      .from(avatarContainerRef.value, {
        width: 0,
        padding: 0,
        duration: 0.03,
      })
      .to(avatarRef.value, {
        duration: 0.15,
        left: -42,
      })
      .to(avatarRef.value, {
        duration: 0,
        top: 3,
      })
      .to(playerCardRef.value, {
        duration: 0.1,
        width: 0,
        padding: 0,
      })

    whichAnimationPlay(chatInfoFolded.value)
  })

  return { playerCardRef, avatarContainerRef, avatarRef }
}
