
// ==========================================
// 1. SUPABASE CONNECTION
// ==========================================

const SUPABASE_URL = "https://tzfmnfivlvakszdnlizv.supabase.co";

const SUPABASE_KEY = "sb_publishable_L3zinjmfktL9mU2iYwBujg_tB2dcBtz";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

console.log("Supabase connected successfully!");


// ==========================================
// 2. GENERAL SCROLL REVEAL
// ==========================================

const reveals = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2
    });

    reveals.forEach((element) => observer.observe(element));

} else {

    reveals.forEach((element) => {
        element.classList.add("active");
    });

}


// ==========================================
// 3. GSAP HORIZONTAL SCROLL ANIMATION
// ==========================================

if (
    typeof gsap !== "undefined" &&
    typeof ScrollTrigger !== "undefined"
) {

    gsap.registerPlugin(ScrollTrigger);

    const track = document.querySelector(".horizontal-track");
    const section = document.querySelector(".horizontal-work");

    if (track && section) {

        const getScrollAmount = () =>
            Math.max(0, track.scrollWidth - window.innerWidth);

        gsap.to(track, {
            x: () => -getScrollAmount(),
            ease: "none",

            scrollTrigger: {
                trigger: section,
                start: "top top",
                end: () => "+=" + getScrollAmount(),
                pin: true,
                scrub: 1,
                invalidateOnRefresh: true
            }
        });
    }
}


// ==========================================
// 4. COURSES SCROLL REVEAL
// ==========================================

const courseRevealElements =
    document.querySelectorAll(".courses-reveal");

if ("IntersectionObserver" in window) {

    const courseObserver = new IntersectionObserver(
        (entries, obs) => {

            entries.forEach((entry) => {

                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    obs.unobserve(entry.target);
                }

            });

        },
        {
            threshold: 0.15,
            rootMargin: "0px 0px -50px 0px"
        }
    );

    courseRevealElements.forEach((element) => {
        courseObserver.observe(element);
    });

} else {

    courseRevealElements.forEach((element) => {
        element.classList.add("is-visible");
    });

}


// ==========================================
// 5. COURSE CARD 3D HOVER EFFECT
// ==========================================

const canTilt =
    window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (canTilt) {

    document.querySelectorAll(".course-card").forEach((card) => {

        card.addEventListener("mousemove", (event) => {

            const rect = card.getBoundingClientRect();

            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;

            card.style.transform =
                `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-10px)`;

        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = "";
        });

    });

}


// ==========================================
// 6. BOOKING POPUP ELEMENTS
// ==========================================

const bookingModal = document.getElementById("bookingModal");
const closeBooking = document.getElementById("closeBooking");
const bookingForm = document.getElementById("bookingForm");
const selectedCourse = document.getElementById("selectedCourse");
const bookingMessage = document.getElementById("bookingMessage");
const bookingDate = document.getElementById("bookingDate");


// ==========================================
// 7. SET MINIMUM BOOKING DATE
// ==========================================

if (bookingDate) {

    const today = new Date();

    const localDate = new Date(
        today.getTime() - today.getTimezoneOffset() * 60000
    ).toISOString().split("T")[0];

    bookingDate.min = localDate;

}


// ==========================================
// 8. OPEN BOOKING POPUP
// ==========================================

document.querySelectorAll(".course-btn").forEach((button) => {

    button.addEventListener("click", () => {

        if (!bookingModal || !selectedCourse) return;

        selectedCourse.value = button.dataset.course;

        if (bookingMessage) {
            bookingMessage.textContent = "";
            bookingMessage.style.color = "#a78bfa";
        }

        bookingModal.classList.add("active");

    });

});


// ==========================================
// 9. CLOSE BOOKING POPUP
// ==========================================

if (closeBooking && bookingModal) {

    closeBooking.addEventListener("click", () => {
        bookingModal.classList.remove("active");
    });

    bookingModal.addEventListener("click", (event) => {

        if (event.target === bookingModal) {
            bookingModal.classList.remove("active");
        }

    });

}


// ==========================================
// 10. SUBMIT BOOKING TO SUPABASE
// ==========================================

if (bookingForm) {

    bookingForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        if (!bookingMessage || !bookingDate || !selectedCourse) {
            return;
        }

        const name =
            document.getElementById("studentName").value.trim();

        const email =
            document.getElementById("studentEmail").value.trim();

        const phone =
            document.getElementById("studentPhone").value.trim();

        const course = selectedCourse.value;
        const date = bookingDate.value;

        if (!name || !email || !phone || !course || !date) {

            bookingMessage.textContent =
                "Please complete all fields.";

            return;
        }

        if (date < bookingDate.min) {

            bookingMessage.textContent =
                "Please select a valid booking date.";

            return;
        }

        const submitButton =
            bookingForm.querySelector('button[type="submit"]');

        bookingMessage.style.color = "#a78bfa";
        bookingMessage.textContent = "Submitting your booking...";

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Submitting...";
        }

        try {

            const { error } = await supabaseClient
                .from("bookings")
                .insert([
                    {
                        student_name: name,
                        email: email,
                        phone: phone,
                        course: course,
                        booking_date: date
                    }
                ]);

            if (error) {
                throw error;
            }

            bookingMessage.style.color = "#a78bfa";

            bookingMessage.textContent =
                "🎉 Your booking request has been received!";

            bookingForm.reset();

            setTimeout(() => {

                if (bookingModal) {
                    bookingModal.classList.remove("active");
                }

                bookingMessage.textContent = "";

            }, 2500);

        } catch (error) {

            console.error("Supabase booking error:", error);

            bookingMessage.style.color = "#ff6b6b";

            bookingMessage.textContent =
                "Unable to submit your booking. Please try again.";

        } finally {

            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = "Submit Booking";
            }

        }

    });

}
