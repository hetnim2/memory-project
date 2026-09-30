const mobileQuotes = [
    {
        context: "어려운 일을 앞두고\n스스로 마음을 다잡으며",
        quote: "다른 인간에게 가능한 일이라면,\n나에게도 가능하다.",
        author: "마르쿠스 아우렐리우스"
    },
    {
        context: "절망 속에서도 삶의 의미를 찾으며",
        quote: "삶에서 무엇을 기대할지가 아니라,\n삶이 우리에게 무엇을 기대하는지가 중요하다.",
        author: "빅터 프랭클"
    },
    {
        context: "큰일도 작은 시작에서 이루어진다고 말하며",
        quote: "천 리 길도\n발밑에서 시작된다.",
        author: "노자"
    },
    {
        context: "결과보다 온 힘을 다한 노력을 이야기하며",
        quote: "만족은 성취가 아니라 노력에 있다.\n온전한 노력은 온전한 승리다.",
        author: "마하트마 간디"
    },
    {
        context: "바깥의 성공보다 자신의 내면을 바라보며",
        quote: "평화는 밖에서 오는 것이 아니라,\n자신에게서 온다.",
        author: "랄프 왈도 에머슨"
    },
    {
        context: "인생을 한 편의 연극에 비유하며",
        quote: "주어진 역할이 무엇이든,\n그것을 잘 살아내는 것이 나의 몫이다.",
        author: "에픽테토스"
    },
    {
        context: "세상이 말하는 성공보다\n자신의 이상을 바라보며",
        quote: "닿지 못해도 바라보고, 믿고,\n그것이 이끄는 곳을 따라가리라.",
        author: "루이자 메이 올컷"
    },
    {
        context: "상실과 나이 듦 속에서도\n다시 앞으로 나아가며",
        quote: "새로운 세계를 찾기에\n아직 늦지 않았다.",
        author: "앨프리드 테니슨"
    },
    {
        context: "낙담 속에서도 오늘을 살아가야 한다고 쓰며",
        quote: "계속 이루고, 계속 나아가며,\n일하고 기다리는 법을 배우라.",
        author: "헨리 워즈워스 롱펠로"
    },
    {
        context: "세상과 다시 연결되기 시작했던 순간을 돌아보며",
        quote: "어둠은 다시 나를 가둘 수 없다.\n나는 이미 해안을 보았다.",
        author: "헬렌 켈러"
    },
    {
        context: "숨어 지내던 1944년,\n우울할 때 무엇을 바라봐야 하는지 적으며",
        quote: "아직 남아 있는 아름다운 것들을 생각하고,\n행복해지세요.",
        author: "안네 프랑크"
    },
    {
        context: "폭풍 속에서도 사라지지 않는 희망을 노래하며",
        quote: "희망은 영혼에 내려앉아\n멈추지 않고 노래하는 새와 같다.",
        author: "에밀리 디킨슨"
    },
    {
        context: "꿈을 잃어버린 삶이 어떤 모습인지 이야기하며",
        quote: "꿈을 꼭 붙들어라.",
        author: "랭스턴 휴스"
    },
    {
        context: "차별과 상처 앞에서도 다시 일어서겠다고 선언하며",
        quote: "그래도 나는\n다시 일어난다.",
        author: "마야 안젤루"
    },
    {
        context: "외롭고 자신을 자책하는 사람에게\n세상 속 자신의 자리를 이야기하며",
        quote: "세상은 너를,\n만물의 가족 속으로 부른다.",
        author: "메리 올리버"
    },
    {
        context: "나이 듦도 삶의 완성으로 향하는 과정이라 말하며",
        quote: "나와 함께 늙어가자.\n가장 좋은 날들은 아직 남아 있다.",
        author: "로버트 브라우닝"
    },
    {
        context: "미움과 차별을 겪은 뒤에도\n사랑의 가능성을 이야기하며",
        quote: "미움을 배울 수 있다면,\n사랑도 배울 수 있다.",
        author: "넬슨 만델라"
    },
    {
        context: "시간과 변화에도 흔들리지 않는 사랑을 말하며",
        quote: "변화를 만났다고 변하는 사랑이라면,\n그것은 사랑이 아니다.",
        author: "윌리엄 셰익스피어"
    },
    {
        context: "오랜 시간이 지나 다시 찾은 장소에서\n삶을 돌아보며",
        quote: "삶을 이루는 것은\n이름 없는 작은 친절과 사랑의 행동들이다.",
        author: "윌리엄 워즈워스"
    },
    {
        context: "1782년,\n처음 아버지가 된 기쁨을 말하며",
        quote: "비로소 아비라는 호칭을 듣게 되었으니,\n이것이 다행스럽다.",
        author: "정조"
    }
];

const contextEl = document.getElementById("mobileQuoteContext");
const textEl = document.getElementById("mobileQuoteText");
const authorEl = document.getElementById("mobileQuoteAuthor");

if (contextEl && textEl && authorEl) {
    const item =
        mobileQuotes[Math.floor(Math.random() * mobileQuotes.length)];

    contextEl.textContent = item.context;
    textEl.textContent = `“${item.quote}”`;
    authorEl.textContent = `— ${item.author}`;
}