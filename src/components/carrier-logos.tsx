import React from 'react';

export const Dhl = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 330" {...props}>
    <path fill="#FFCC00" d="M0 0h1200v330H0z"/>
    <path fill="#D40511" d="M125 15h184l-44 150h-85zm140 150h190l-45 150h-92zm-140 0h183l-44 150H0zm283-75h85l44-75h85l-44 75h140l-44 150h-85l44 75h-85l-44-75H238z"/>
  </svg>
);

export const Fedex = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 30" {...props}>
    <text x="0" y="25" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="bold" fill="#4D148C">Fed</text>
    <text x="45" y="25" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="bold" fill="#FF6600">Ex</text>
  </svg>
);

export const Ups = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" {...props}>
    <path fill="#351C15" d="M0 0h200v200H0z"/>
    <path fill="#FFB500" d="M30 40h140v120H30z"/>
    <path fill="#351C15" d="M40 50h120v100H40z"/>
    <path fill="#FFB500" d="M50 60h100v80H50z"/>
    <path fill="#351C15" d="M60 70h80v60H60z"/>
    <text x="100" y="130" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="60" fontWeight="bold" fill="#FFB500">UPS</text>
  </svg>
);

export const LaPoste = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 125 42" {...props}>
        <g fill="#242d75">
            <path d="M4.1 34.6h5.8v-7.1h4.1v-4.6h-4.1v-4.1h7.2V14h-7.2V9.8h8.2V5.2h-14v29.4zM24.7 34.6h11.2c4.1 0 6.6-2.5 6.6-6.3v-11c0-3.8-2.5-6.3-6.6-6.3H24.7v23.6zm5.8-4.6v-14.4h4.4c1.4 0 2.2 1 2.2 2.9v8.5c0 2-0.8 3-2.2 3h-4.4zM54.1 34.6h5.8V5.2h-5.8v29.4zM64.7 34.6h11.2c4.1 0 6.6-2.5 6.6-6.3v-11c0-3.8-2.5-6.3-6.6-6.3H64.7v23.6zM70.5 30v-14.4h4.4c1.4 0 2.2 1 2.2 2.9v8.5c0 2-0.8 3-2.2 3h-4.4zM95.6 11.1c-3.1-3.1-7.3-4.8-11.8-4.8s-8.7 1.7-11.8 4.8c-3.1 3.1-4.8 7.3-4.8 11.8s1.7 8.7 4.8 11.8c3.1 3.1 7.3 4.8 11.8 4.8s8.7-1.7 11.8-4.8c3.1-3.1 4.8-7.3 4.8-11.8s-1.7-8.7-4.8-11.8zm-2.7 19.3c-2.2 2.2-5.1 3.5-8.8 3.5s-6.6-1.2-8.8-3.5c-2.2-2.2-3.5-5.1-3.5-8.8s1.2-6.6 3.5-8.8c2.2-2.2 5.1-3.5 8.8-3.5s6.6 1.2 8.8 3.5c2.2 2.2 3.5 5.1 3.5 8.8s-1.3 6.6-3.5 8.8z"/>
        </g>
        <path d="M110.8 0c-6.1 0-11 4.9-11 11s4.9 11 11 11 11-4.9 11-11-4.9-11-11-11zm0 17.5c-3.6 0-6.5-2.9-6.5-6.5s2.9-6.5 6.5-6.5 6.5 2.9 6.5 6.5-2.9 6.5-6.5 6.5z" fill="#fec901"/>
    </svg>
);


export const Chronopost = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 40" {...props}>
        <text x="0" y="30" fontFamily="Arial, sans-serif" fontSize="35" fontWeight="bold" fill="#E30613">chrono</text>
        <text x="115" y="30" fontFamily="Arial, sans-serif" fontSize="35" fontWeight="bold" fill="#000000">post</text>
    </svg>
);

export const Colissimo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20" {...props}>
        <text x="0" y="15" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="bold" fill="#000000">Colissimo</text>
    </svg>
);