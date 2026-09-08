\LoadClass[a4paper,12pt]{report} % Charge la classe de base "report" avec format A4 et police de taille 12pt

%--------------------- Packages ------------------------

\RequirePackage[french]{babel} 
% Définit le français comme langue principale (traductions automatiques, césures...)

\RequirePackage[utf8]{inputenc} 
% Gère les caractères accentués dans le fichier source

\RequirePackage[section]{placeins} 
% Force les figures/tables à rester dans leur section respective

\RequirePackage[T1]{fontenc} 
% Encodage des fontes pour un meilleur rendu des caractères accentués

\RequirePackage{mathtools} 
% Améliore les fonctionnalités de amsmath pour les équations

\RequirePackage{siunitx} 
% Pour écrire des nombres en notation scientifique et unités SI

\RequirePackage{float} 
% Permet de mieux positionner les figures avec l'option [H]

\RequirePackage{graphicx} 
% Pour insérer des images

\RequirePackage[justification=centering]{caption} 
% Centre les légendes des figures et tableaux

\RequirePackage{subcaption} 
% Permet de gérer des sous-figures (ex : Figure 1a, 1b...)

\RequirePackage{wallpaper} 
% Permet d'ajouter des images en arrière-plan (watermarks)

\RequirePackage{nomencl} 
% Pour créer une nomenclature (liste des symboles utilisés)

%\makenomenclature 
% (décommenter si tu veux activer la création de la nomenclature)

\RequirePackage{fancyhdr} 
% Permet de personnaliser les en-têtes et pieds de page

%\pagestyle{fancy}
%\fancyheadoffset{1cm}
%\setlength{\headheight}{2cm}
% (Ces lignes sont commentées mais servent à personnaliser encore plus les en-têtes/pieds)

\RequirePackage{url} 
% Gère le format des URLs (utilisé dans les bibliographies)

\RequirePackage[hidelinks]{hyperref} 
% Active les hyperliens sans les encadrer de couleur (liens discrets)

\RequirePackage[left=3cm,right=3cm,top=3cm,bottom=5cm,headheight=15mm]{geometry} 
% Définit les marges du document


%-------------------- Informations sur le rapport ----------------------
% Ces commandes permettent de stocker des informations à afficher dans la page de garde 

\newcommand{\mention}[1]{\renewcommand{\mention}{#1}}
\newcommand{\trigrammemention}[1]{\renewcommand{\trigrammemention}{#1}}
\newcommand{\master}[1]{\renewcommand{\master}{#1}}
\newcommand{\filiere}[1]{\renewcommand{\filiere}{#1}}

\newcommand{\titre}[1]{\renewcommand{\titre}{#1}}

\newcommand{\eleve}[1]{\renewcommand{\eleve}{#1}}

\newcommand{\tuteuruniv}[1]{\renewcommand{\tuteuruniv}{#1}}
\newcommand{\membresjury}[1]{\renewcommand{\membresjury}{#1}}
\newcommand{\tuteurentreprise}[1]{\renewcommand{\tuteurentreprise}{#1}}

\newcommand{\logoentreprise}[1]{\renewcommand{\logoentreprise}{#1}}

\newcommand{\dates}[1]{\renewcommand{\dates}{#1}}

%------------------------------En-têtes et pieds de page personnalisés -------------------------

\newcommand{\fairemarges}{
\makenomenclature % Active la nomenclature
\pagestyle{fancy} % Applique le style fancy aux pages

\fancyheadoffset{0.5cm} 
% Décale un peu les en-têtes

\lhead{\includegraphics[scale=0.1]{logos/emsi.png}} 
% Logo à gauche de l’en-tête

\rhead{\nouppercase{\leftmark}} 
% À droite : le nom du chapitre actuel sans être forcé en majuscules

\rfoot{\thepage} 
% Numéro de page à droite du pied de page

\cfoot{\textbf{\titre}} 
% Titre du rapport centré en bas

\lfoot{\trigrammemention} 
% Trigramme du parcours en bas à gauche
}



\newcommand{\fairepagedegarde}{
\begin{titlepage}

\ThisLRCornerWallPaper{0.3}{logos/coin_bas.png}
\ThisULCornerWallPaper{0.3}{logos/coin_haut.png}
% Insère des images de fond dans les coins haut gauche et bas droit

\centering % Centre tout le contenu suivant

% --- Bloc avec les deux logos ---
\noindent
\begin{minipage}{.5\textwidth}
    \centering
    \includegraphics[width=0.6\textwidth]{\logoentreprise}\par\vspace{1cm}
\end{minipage}%
\begin{minipage}{.5\textwidth}
    \centering
    \includegraphics[width=0.6\textwidth]{logos/emsi.png}\par\vspace{1cm}
\end{minipage}

% --- Titre ---
\leavevmode\par
\rule{\linewidth}{0.2 mm}\par\vspace{0.4cm}
{\huge\bfseries \titre \par}
\rule{\linewidth}{0.2 mm}\par\vspace{1.0cm}

% --- Étudiant ---
{\scshape\Large \eleve \par} 
\vspace{1.0cm}

% --- Formation ---
{\scshape \mention \\ \filiere \\ \master \par} 
\vspace{1cm}

% --- Dates ---
{\large \dates \par} 
\vspace{2cm}

% --- Tuteur universitaire ---
\begin{minipage}{0.5\textwidth}
    \centering
    \large
	\begin{center} 
	\emph{\textbf{Tuteur(s) EMSI :}}\\ 
    \tuteuruniv \\ 
	\end{center}
\end{minipage}%
% --- Membres du jury ---
\begin{minipage}{0.5\textwidth}
    \centering
    \large
	\begin{center} 
%        \vspace{1cm} % <<< C'EST CETTE LIGNE QUI DOIT ÊTRE SUPPRIMÉE OU COMMENTÉE
	\emph{\textbf{Membres du jury :}} \\
	 \membresjury \\
	\end{center}
\end{minipage}\\[4cm]

\end{titlepage}
}

%-----------------Table des matières

\newcommand{\tabledematieres}{
\tableofcontents
%\newpage
}

%--------------------Insertion de figures personnalisée
\newcommand{\insererfigure}[4]{
\begin{figure}[ht]
\centering
\includegraphics[height=#2]{#1}
\caption{#3}
\label{fig: #4}
\end{figure}
}
