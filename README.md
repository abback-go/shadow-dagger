# Shadow Dagger: ECLIPSE

> 타격감(juice)을 극한으로 끌어올린 단일 보스 액션 게임
> 순수 `<canvas>` + vanilla JS · 외부 라이브러리 0개 · 단일 HTML 파일

![status](https://img.shields.io/badge/status-prototype-orange)
![deps](https://img.shields.io/badge/dependencies-none-brightgreen)
![tech](https://img.shields.io/badge/tech-canvas%20%2B%20vanilla%20JS-blue)

---

## 개요

단검 암살자가 되어 **Shadow Knight** 한 명과 끝까지 싸우는 보스 러시 게임입니다.

스테이지도, 잡몹도 없습니다. 오직 보스 하나와의 공방에만 집중하고, 그 대신 **때리는 손맛과 화면 연출**에 모든 자원을 투입했습니다. 히트스톱, 화면 흔들림, 슬로우모션, 파티클, 네온 글로우가 매 타격마다 겹쳐 작동합니다.

빌드 과정이 없습니다. `index.html`을 더블클릭하면 바로 실행됩니다.

---

## 실행 방법

### 1. 로컬 실행

```bash
git clone https://github.com/abback-go/shadow-dagger.git
cd shadow-dagger
```

`index.html`을 브라우저로 열면 끝입니다. 서버도, 설치도 필요 없습니다.

### 2. 온라인 플레이

GitHub Pages 배포 예정입니다.

**권장 브라우저**: Chrome, Edge (Chromium 계열)

---

## 조작법

| 키 | 동작 | 비고 |
|:--|:--|:--|
| `←` `→` | 이동 | |
| `Space` / `↑` | 점프 · 더블 점프 | 공중에서 1회 추가 |
| `Z` | 기본 공격 (3연타 콤보) | 3타에 넉백 |
| `X` | 표창 던지기 | MP 소모 |
| `C` | 그림자 대시 | 무적 + 잔상 + 접촉 데미지 |
| `Q` | 궁극기 — 라이트닝 | 차지 게이지 필요 |
| `Shift` | 회피 | 무적 프레임 |

### 퍼펙트 회피

보스 공격이 적중하기 **직전**에 회피하면 슬로우모션이 걸리고 반격 윈도우가 열립니다. 스파크 이펙트가 성공 신호입니다.

콤보를 길게 이어갈수록 데미지가 증가하므로, 무작정 피하기보다 반격 윈도우를 노리는 편이 유리합니다.

---

## 보스 — Shadow Knight

체력 구간에 따라 3페이즈로 전환됩니다. 페이즈가 바뀔 때마다 패턴이 추가되며, 이전 패턴은 사라지지 않습니다.

| 페이즈 | HP 구간 | 추가되는 패턴 |
|:--|:--|:--|
| **P1** | 100 ~ 66% | 돌진 베기, 투사체 물결 |
| **P2** | 66 ~ 33% | 지면 강타 충격파, 순간이동 기습 |
| **P3 (격노)** | 33 ~ 0% | 광역기, 그림자 분신, 공격 속도 증가 |

모든 공격에는 **windup 예열 플래시**가 선행합니다. 반응만 하면 반드시 피할 수 있도록 설계했습니다. 즉발 공격은 없습니다.

---

## 타격감 시스템

이 프로젝트의 핵심입니다. 여덟 가지 요소가 동시에 작동합니다.

| 요소 | 구현 방식 |
|:--|:--|
| **히트스톱** | 적중 순간 프레임 정지, 타격 강도에 비례 |
| **화면 흔들림** | trauma 값 기반, 제곱 감쇠 |
| **슬로우모션** | 페이즈 전환 · 막타 · 퍼펙트 회피 시 발동 |
| **파티클** | 베기 궤적, 스파크, 대시 잔상, 착지 먼지, 피격 파편 |
| **네온 글로우** | additive blend + `shadowBlur` |
| **콤보 시스템** | 연타 카운터 → 데미지 증가 + 숫자 연출 |
| **데미지 넘버** | 떠오르는 숫자, 크리티컬 강조 표시 |
| **줌 펀치** | 큰 타격 시 카메라 미세 줌인 |

---

## 화면 흐름

```
TITLE  →  HOW TO PLAY  →  PLAY  →  WIN / LOSE
```

**HUD 구성**
- 보스 HP 바 (페이즈 구간이 분절 표시됨)
- 플레이어 HP / MP
- 콤보 카운터
- 스킬 쿨다운 아이콘
- 궁극기 차지 게이지

**결과 화면**: 클리어 타임, 최대 콤보, 랭크(S / A / B)

---

## 기술 구조

단일 파일이지만 내부는 섹션 단위로 모듈화되어 있습니다.

```
고정 타임스텝 루프 (accumulator) + requestAnimationFrame
│
├─ config          상수 · 튜닝 값
├─ input           키 입력 상태 관리
├─ particles       파티클 풀
├─ effects         shake · hitstop · slowmo · flash
├─ entities        player · boss · projectile · clone
├─ combat          공격 판정 · 충돌
├─ render layers   레이어별 그리기
└─ state machine   화면 전환
```

**고정 타임스텝을 쓰는 이유**: 히트스톱과 슬로우모션이 프레임 단위로 정확히 동작해야 하기 때문입니다. 가변 델타타임에서는 타격감이 모니터 주사율에 따라 달라집니다.

---

## 프로젝트 구조

```
shadow-dagger/
├─ index.html      게임 본체 (단일 파일)
├─ arcane/         (설명 추가 예정)
├─ docs/
│  └─ specs/       설계 문서
└─ .gitignore
```

---

## 개발 현황

현재 **초기 프로토타입** 단계입니다. 설계 문서의 방향은 확정되었고, 구현이 진행 중입니다.

진행 상황은 [Issues](https://github.com/abback-go/shadow-dagger/issues)와 [Projects](https://github.com/abback-go/shadow-dagger/projects)에서 확인할 수 있습니다.

**의도적으로 제외한 것**
- 사운드 — 시각적 타격감에 집중하기 위해 범위에서 제외
- 소환수(E 키) — 원본에는 있으나 단일 보스 구도에 집중하기 위해 제거

---

## 문서

- [설계 문서 (2026-05-25)](docs/specs/2026-05-25-shadow-dagger-eclipse-design.md)

---

## 원본

원본 *Shadow Dagger*(단검 암살자 vs 그림자 기사)를 기반으로, 타격감과 비주얼을 강화한 재해석 버전입니다.

원본: <https://studyemomo-blip.github.io/pr1.github.io/>
