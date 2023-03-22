import React from "react";
import "./About.scss";

const About = () => {
  return (
    <section className="about">
      <p>About Auther</p>
      <p>
        This Software is made by{" "}
        <a href="https://github.com/kawadumax">kawadumax</a>
      </p>
      <p>
        He is currently looking for a position as an audio software engineer.
        <br />
        If you would like to hire him, please feel free to contact (
        ultima.times.sounds[at]gmail.com ).
      </p>
      <p>
        このソフトウェアは <a href="https://github.com/kawadumax">kawadumax</a>{" "}
        によって作られました。
      </p>
      <p>
        彼は今、音響ソフトウェアのエンジニアの職を求めています。
        <br />
        彼を雇ってあげたい場合はこちら( ultima.times.sounds[at]gmail.com
        )に連絡してみてください。
      </p>
    </section>
  );
};

export default About;
