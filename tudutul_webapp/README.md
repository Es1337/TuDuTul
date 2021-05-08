#Praca z frontem

##Intro
Przed robieniem czegokolwiek odpalcie sobie w folderze głównym npm install, żeby pobrać wszystko co potrzebne

##Foldery
Node_modules -> wiadomo, dodałem biblioteki npm'a więc się pojawia  
Src (ważne dla css'a) -> Tutaj są pliki css/js, ktore pozniej kompilujemy
w wynikowe pliki  
Static -> Stąd ładujemy pliki css/js, w index.html można podpatrzeć jak to robić
Templates/tutudul-webapp -> Tutaj wrzucamy pliki html

##Package.json
Dodałem do projektu (czy będzie dzialac na deployu, to sie okaze) framework css'owy TailwindCSS.  
Dzięki niemu nie trzeba tworzyc klas css'owych, tylko mozna atrybuty podawac jako klasy w html'u (trochę zmienione, trzeba popatrzec w dokumentacji).  
  
Ewentualnie dodatkowe klasy dodajemy do tailwind.css    
  
WAŻNE!  
  
Po każdej zmianie w tailwind.css lub dodaniu klasy tailwindcss w HTML'u trzeba uruchomic npm run build:css -> na nowo
tworzymy wtedy tailwind_compiled.css, ktory pozniej strona pobiera
  
Jeśli nie widac zmian trzeba zrobic odswiezenie z usunieciem cache'u ctrl + shift + r

##Kolory (dla Michała i nie tylko)
"Tu" w "TuDu" -> lightblue -> klasa .redMain rgb(173, 216, 230)  
"Du" w "TuDu" -> lightcoral -> klasa .blueMain rgb(240, 128, 128)  
background / tlo loginu -> purple -> rgb(128, 0, 128)  
tło -> w klasie css'owej .mainBackground  
naglowek pola login/register / tło przyciskow -> text-yellow-400 -> #FBBF24  
kolor napisu na przycisku -> text-yellow-700 -> #B45309  