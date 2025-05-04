---
layout: default
title: Games
permalink: /games/
---

<h1>Games</h1>
<ul>
  {% for page in site.pages %}
    {% if page.categories contains "games" %}
      <li><a href="{{ page.url }}">{{ page.title }}</a></li>
    {% endif %}
  {% endfor %}
</ul>
