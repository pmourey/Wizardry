(* ========================================================================== *)
(* WIZARDRY I: PROVING GROUNDS OF THE MAD OVERLORD — UCSD PASCAL SOURCE CODE  *)
(* Extracted directly from Apple II UCSD-Pascal disk images (Wiz1A..Wiz1E.DSK)*)
(* by scripts/extract_pgmo.py (UCSD block reader compatible with WizardryApp) *)
(* ========================================================================== *)


(* ========================================================================== *)
(* DISK: Wiz1A.DSK | FILE: WIZ.TEXT                                    *)
(* ========================================================================== *)

(*$S++*)
(*$L PRINTER: *)
(* "$S++" OPTION BEFORE "$L" *)
(*$R-*)
(*$I-*)
(*$V-*)

(*
  WIZARDRY I (PROVING GROUNDS), WIZARDRY.CODE
  REVERSE ENGINEERED BY:
    
    THOMAS WILLIAM EWERS
      (MAR - JUN 2014)
*)


PROGRAM WIZARDRY;

  CONST
        BLOCKSZ = 512;
        DRIVE1  = 4;
        CRETURN = 13;
        
  TYPE
  
        TXGOTO = (XDONE,    XTRAININ, XCASTLE,  XGILGAMS, XINSPECT, XBOLTAC,
                  XCANT,    XRUNNER,  XCOMBAT,  XNEWMAZE, XCHK4WIN, XREWARD,
                  XINSPCT2, XEQUIP6,  XEQPDSP,  XREORDER, XCEMETRY, XINSPCT3,
                  XBCK2CMP, XBCK2ROL, XCMP2EQ6, XUNUSED,  XREWARD2, XSCNMSG,
                  XCAMPSTF, XEDGTOWN, XINSAREA, XBK2CMP2);
                  
        TWIZLONG = RECORD
            LOW  : INTEGER;
            MID  : INTEGER;
            HIGH : INTEGER;
          END;
                   
        TRACE = (NORACE, HUMAN, ELF, DWARF, GNOME, HOBBIT);
        
        TCLASS = (FIGHTER, MAGE, PRIEST, THIEF,
                  BISHOP, SAMURAI, LORD, NINJA);
          
        TALIGN = (UNALIGN, GOOD, NEUTRAL, EVIL);
          
        TSTATUS = (OK, AFRAID, ASLEEP, PLYZE, 
                   STONED, DEAD, ASHES, LOST);
        
        TATTRIB = (STRENGTH, IQ, PIETY, VITALITY, AGILITY, LUCK);
        
        TSPELL7G = ARRAY[ 1..7] OF INTEGER;
        
        THPREC = RECORD
            LEVEL   : INTEGER;
            HPFAC   : INTEGER;
            HPMINAD : INTEGER;
          END;
                 
        TCHAR = RECORD
            NAME     : STRING[ 15];
            PASSWORD : STRING[ 15];
            INMAZE   : BOOLEAN;
            RACE     : TRACE;
            CLASS    : TCLASS;
            AGE      : INTEGER;
            STATUS   : TSTATUS;
            ALIGN    : TALIGN;
            ATTRIB   : PACKED ARRAY[ STRENGTH..LUCK] OF 0..18;
            LUCKSKIL : PACKED ARRAY[ 0..4] OF 0..31;
            GOLD     : TWIZLONG;
            POSS     : RECORD
                POSSCNT : INTEGER;
                POSSESS : ARRAY[ 1..8] OF RECORD
                    EQUIPED : BOOLEAN;
                    CURSED  : BOOLEAN;
                    IDENTIF : BOOLEAN;
                    EQINDEX : INTEGER;
                  END;
              END;
            EXP      : TWIZLONG;
            MAXLEVAC : INTEGER;
            CHARLEV  : INTEGER;
            HPLEFT   : INTEGER;
            HPMAX    : INTEGER;
            SPELLSKN : PACKED ARRAY[ 0..49] OF BOOLEAN;
            MAGESP   : TSPELL7G;
            PRIESTSP : TSPELL7G;
            HPCALCMD : INTEGER;
            ARMORCL  : INTEGER;
            HEALPTS  : INTEGER;
            CRITHITM : BOOLEAN;
            SWINGCNT : INTEGER;
            HPDAMRC  : THPREC;
            WEPVSTY2 : PACKED ARRAY[ 0..1, 0..13] OF BOOLEAN;
            WEPVSTY3 : PACKED ARRAY[ 0..1, 0..6] OF BOOLEAN;
            WEPVSTYP : PACKED ARRAY[ 0..13] OF BOOLEAN;
            LOSTXYL  : RECORD CASE INTEGER OF
                1:  (LOCATION : ARRAY[ 1..4] OF INTEGER);
                2:  (POISNAMT : ARRAY[ 1..4] OF INTEGER);
                3:  (AWARDS   : ARRAY[ 1..4] OF INTEGER);
              END;
          END;
              
        TOBJTYPE = (WEAPON, ARMOR, SHIELD, HELMET, GAUNTLET,
                    SPECIAL, MISC);
                          
        TOBJREC = RECORD
            NAME     : STRING[ 15];
            NAMEUNK  : STRING[ 15];
            OBJTYPE  : TOBJTYPE;
            ALIGN    : TALIGN;
            CURSED   : BOOLEAN;
            SPECIAL  : INTEGER;
            CHANGETO : INTEGER;
            CHGCHANC : INTEGER;
            PRICE    : TWIZLONG;
            BOLTACXX : INTEGER;
            SPELLPWR : INTEGER;
            CLASSUSE : PACKED ARRAY[ TCLASS] OF BOOLEAN;
            HEALPTS  : INTEGER;
            WEPVSTY2 : PACKED ARRAY[ 0..15] OF BOOLEAN;
            WEPVSTY3 : PACKED ARRAY[ 0..15] OF BOOLEAN;
            ARMORMOD : INTEGER;
            WEPHITMD : INTEGER;
            WEPHPDAM : THPREC;
            XTRASWNG : INTEGER;
            CRITHITM : BOOLEAN;
            WEPVSTYP : PACKED ARRAY[ 0..13] OF BOOLEAN;
          END;

        TWALL = (OPEN, WALL, DOOR, HIDEDOOR);
   
        TSQUARE = (NORMAL, STAIRS, PIT, CHUTE, SPINNER, DARK, TRANSFER,
                   OUCHY, BUTTONZ, ROCKWATE, FIZZLE, SCNMSG, ENCOUNTE);
   
        TMAZE = RECORD
            W : PACKED ARRAY[ 0..19] OF PACKED ARRAY[ 0..19] OF TWALL;
            S : PACKED ARRAY[ 0..19] OF PACKED ARRAY[ 0..19] OF TWALL;
            E : PACKED ARRAY[ 0..19] OF PACKED ARRAY[ 0..19] OF TWALL;
            N : PACKED ARRAY[ 0..19] OF PACKED ARRAY[ 0..19] OF TWALL;
            
            FIGHTS : PACKED ARRAY[ 0..19] OF PACKED ARRAY[ 0..19] OF 0..1;
                       
            SQREXTRA : PACKED ARRAY[ 0..19] OF PACKED ARRAY[ 0..19] OF 0..15;
                       
            SQRETYPE : PACKED ARRAY[ 0..15] OF TSQUARE;
            
            AUX0   : PACKED ARRAY[ 0..15] OF INTEGER;
            AUX1   : PACKED ARRAY[ 0..15] OF INTEGER;
            AUX2   : PACKED ARRAY[ 0..15] OF INTEGER;
                       
            ENMYCALC : PACKED ARRAY[ 1..3] OF RECORD
                         MINENEMY : INTEGER;
                         MULTWORS : INTEGER;
                         WORSE01  : INTEGER;
                         RANGE0N  : INTEGER;
                         PERCWORS : INTEGER;
                       END;
          END;
        
        TENEMY = RECORD
            NAMEUNK  : STRING[ 15];
            NAMEUNKS : STRING[ 15];
            NAME     : STRING[ 15];
            NAMES    : STRING[ 15];
            PIC      : INTEGER;
            CALC1    : TWIZLONG;
            HPREC    : THPREC;
            CLASS    : INTEGER;
            AC       : INTEGER;
            RECSN    : INTEGER;
            RECS     : ARRAY[ 1..7] OF THPREC;
            EXPAMT   : TWIZLONG;
            DRAINAMT : INTEGER;
            HEALPTS  : INTEGER;
            REWARD1  : INTEGER;
            REWARD2  : INTEGER;
            ENMYTEAM : INTEGER;
            TEAMPERC : INTEGER;
            MAGSPELS : INTEGER;
            PRISPELS : INTEGER;
            UNIQUE   : INTEGER;
            BREATHE  : INTEGER;
            UNAFFCT  : INTEGER;
            WEPVSTY3 : PACKED ARRAY[ 0..15] OF BOOLEAN;
            SPPC     : PACKED ARRAY[ 0..15] OF BOOLEAN;
          END;
                 
        TENEMY2 = RECORD
            A : RECORD
                    IDENTIFI : BOOLEAN;
                    ALIVECNT : INTEGER;
                    ENMYCNT  : INTEGER;
                    ENEMYID  : INTEGER;
                    TEMP04   : ARRAY[ 0..8] OF RECORD
                        VICTIM   : INTEGER;
                        SPELLHSH : INTEGER;
                        AGILITY  : INTEGER;
                        HPLEFT   : INTEGER;
                        ARMORCL  : INTEGER;
                        INAUDCNT : INTEGER;
                        STATUS   : TSTATUS;
                      END;
                  END;
                
            B : TENEMY;
          END;
                   
        TEXP = ARRAY[ FIGHTER..NINJA] OF ARRAY[ 0..12] OF TWIZLONG;
        
        TBCD = ARRAY[ 0..13] OF INTEGER;
                   
        TSPEL012 = (GENERIC, PERSON, GROUP);
        
        TZSCN = (ZZERO, ZMAZE, ZENEMY, ZREWARD, ZOBJECT,
                        ZCHAR, ZSPCCHRS, ZEXP);
                   
        TSCNTOC = RECORD
            GAMENAME : STRING[ 40];
            RECPER2B : ARRAY[ ZZERO..ZEXP] OF INTEGER;
            RECPERDK : ARRAY[ ZZERO..ZEXP] OF INTEGER;
            UNUSEDXX : ARRAY[ ZZERO..ZEXP] OF INTEGER;
            BLOFF    : ARRAY[ ZZERO..ZEXP] OF INTEGER;
            RACE     : ARRAY[ NORACE..HOBBIT]         OF STRING[ 9];
            CLASS    : PACKED ARRAY[ FIGHTER..NINJA]  OF STRING[ 9];
            STATUS   : ARRAY[ OK..LOST]               OF STRING[ 8];
            ALIGN    : PACKED ARRAY[ UNALIGN..EVIL]   OF STRING[ 9];
            SPELLHSH : PACKED ARRAY[ 0..50] OF INTEGER;
            SPELLGRP : PACKED ARRAY[ 0..50] OF 0..7;
            SPELL012 : PACKED ARRAY[ 0..50] OF TSPEL012;
          END;
    
        TBATRSLT = RECORD
            ENMYCNT : ARRAY[ 1..4] OF INTEGER;
            ENMYID  : ARRAY[ 1..4] OF INTEGER;
            DRAINED : ARRAY[ 0..5] OF BOOLEAN;
          END;
          
        TCHRIMAG = PACKED ARRAY[ 0..7] OF 0..255;
        
        
  VAR
  
       PARTYCNT : INTEGER;
       CACHEBL  : INTEGER;
       SCNTOCBL : INTEGER;
       LLBASE04 : INTEGER;  (* REALLY BASE.06 IN WIZ1, BUT IS BASE04 IN LOL *)
       TIMEDLAY : INTEGER;
       CACHEWRI : BOOLEAN;
       INCHAR   : CHAR;
       XGOTO    : TXGOTO;
       XGOTO2   : TXGOTO;
       ATTK012  : INTEGER;
       FIZZLES  : INTEGER;
       CHSTALRM : INTEGER;
       LIGHT    : INTEGER;
       ACMOD2   : INTEGER;
       ENSTRENG : INTEGER;
       BASE12   : RECORD CASE INTEGER OF      (* BASE291 IN LOL *)
                    1: (MYSTRENG : INTEGER);
                    2: (GOTOX    : TXGOTO);
                  END;
       ENEMYINX : INTEGER;
       SAVELEV  : INTEGER;
       SAVEY    : INTEGER;
       SAVEX    : INTEGER;
       DIRECTIO : INTEGER;
       MAZELEV  : INTEGER;
       MAZEY    : INTEGER;
       MAZEX    : INTEGER;
       ENCB4RUN : BOOLEAN;
       FIGHTMAP : PACKED ARRAY[ 0..19, 0..19] OF BOOLEAN;
       CHARDISK : ARRAY[ 0..5] OF INTEGER;
       CHARACTR : ARRAY[ 0..5] OF TCHAR;
       SCNTOC   : TSCNTOC;
       IOCACHE  : PACKED ARRAY[ 0..1023] OF CHAR;
       CHARSET  : PACKED ARRAY[ 0..63] OF TCHRIMAG;
       BASE06B6 : INTEGER; (* UNUSED *)
       MEMPTR   : RECORD CASE INTEGER OF
                    1: (I : INTEGER);
                    2: (P : ^INTEGER);
                  END;
       

(* ---------- BEGIN FORWARD DECLARATIONS ---------- *)

PROCEDURE PRINTBEL; FORWARD;                   (* P010002 *)

FUNCTION GETREC( DATATYPE: TZSCN;              (* P010003 *)
                 DATAINDX: INTEGER;
                 DATASIZE: INTEGER) : INTEGER; FORWARD;
                 
FUNCTION GETRECW( DATATYPE: TZSCN;             (* P010004 *)
                  DATAINDX: INTEGER;
                  DATASIZE: INTEGER) : INTEGER; FORWARD;
                  
PROCEDURE ADDLONGS( VAR FIRST:  TWIZLONG;      (* P010005 *)
                    VAR SECOND: TWIZLONG); FORWARD;
                    
PROCEDURE SUBLONGS( VAR FIRST:  TWIZLONG;      (* P010006 *)
                    VAR SECOND: TWIZLONG); FORWARD;
                    
PROCEDURE BCD2LONG( VAR LONGNUM: TWIZLONG;     (* P010007 *)
                    VAR BCDNUM:  TBCD); FORWARD;
                    
PROCEDURE LONG2BCD( VAR LONGNUM: TWIZLONG;     (* P010008 *)
                    VAR BCDNUM:  TBCD); FORWARD;
                   
PROCEDURE MULTLONG( VAR LONGNUM: TWIZLONG;     (* P010009 *)
                    VAR INTNUM:  INTEGER); FORWARD;

PROCEDURE DIVLONG( VAR LONGNUM: TWIZLONG;      (* P01000A *)
                   VAR INTNUM:  INTEGER); FORWARD;

FUNCTION TESTLONG( FIRST:  TWIZLONG;           (* P01000B *)
                   SECOND: TWIZLONG) : INTEGER; FORWARD;

PROCEDURE PRNTLONG( LONGNUM: TWIZLONG); FORWARD;  (* P01000C *)
                         
PROCEDURE GETKEY; FORWARD;                     (* P01000D *)

PROCEDURE GETLINE( VAR GTSTRING: STRING); FORWARD; (* P01000E *)

FUNCTION GETCHARX( DSPNAMES: BOOLEAN;          (* P01000F *)
                   SOLICIT: STRING) : INTEGER; FORWARD;

PROCEDURE CENTSTR( ASTRING: STRING); FORWARD;  (* P010010 *)

PROCEDURE PAUSE1; FORWARD;                     (* P010011 *)

PROCEDURE PAUSE2; FORWARD;                     (* P010012 *)

PROCEDURE CLEARPIC; FORWARD;                   (* P010013 *)

PROCEDURE GRAPHICS; FORWARD;                   (* P010014 *)

PROCEDURE TEXTMODE; FORWARD;                   (* P010015 *)

PROCEDURE PRINTCHR( ACHAR: CHAR); FORWARD;     (* P010016 *)

PROCEDURE PRINTSTR( ASTRING: STRING); FORWARD; (* P010017 *)

PROCEDURE PRINTNUM( ANUM: INTEGER;             (* P010018 *)
                    FIELDSZ: INTEGER); FORWARD;

PROCEDURE GETSTR( VAR ASTRING: STRING;         (* P010019 *)
                      WINXPOS: INTEGER;
                      WINYPOS: INTEGER); FORWARD;


(* ---------- END FORWARD DECLARATIONS ---------- *)

(* ---------- BEGIN EXTERNALS ------------------- *)


PROCEDURE CLRPICT( A1:  INTEGER;               (* P01001A *)
                   A2:  INTEGER;
                   A3:  INTEGER;
                   A4:  INTEGER); EXTERNAL;

  (* WHEN A4 === 100, THEN CLEAR PICTURE
     WHEN A4 <> 100 AND A4 <> 101 THEN:
     
     DRAWING MAZE USES THIS FOR DRAWING PICTURE (82 X 79 PIXELS).
     
       $0679 = A1   X LOWER BOUNDS (FIRST TIME IT IS 0)
       $06F9 = A2   Y LOWER BOUNDS (0 ALWAYS)
       $0779 = A3   X UPPER BOUNDS (FIRST TIME IT IS 81)
       $07F9 = A4   Y UPPER BOUNDS (79 ALWAYS)
          ...AND NO PICTURE CLEARING           *)
       
PROCEDURE DRAWLINE( X:       INTEGER;          (* P01001B *)
                    Y:       INTEGER;
                    DELTAH:  INTEGER;
                    DELTAV:  INTEGER;
                    LINELEN: INTEGER); EXTERNAL;
 
FUNCTION RANDOM : INTEGER;  EXTERNAL;          (* P01001C *)

  (* RETURNS A VALUE FROM 0 TO 32,767 *)
  

FUNCTION KEYAVAIL : BOOLEAN; EXTERNAL;         (* P01001D *)

PROCEDURE CLRRECT( X:      INTEGER;            (* P01001E *)
                   Y:      INTEGER;
                   WIDTH:  INTEGER;
                   HEIGHT: INTEGER); EXTERNAL;

PROCEDURE MVCURSOR( X: INTEGER;                (* P01001F *)
                    Y: INTEGER); EXTERNAL;
                   
    (* STORE X AT $4F9.  (SLOT #1 RAM SPACE)
       STORE Y AT $579.  (SLOT #1 RAM SPACE)
       
       MVCURSOR( 40, Y)  TURN ON GRAPHICS MODE
       MVCURSOR( 50, Y)  TURN ON TEXT MODE
       MVCURSOR( 60, Y)  JUMP TO $2002  (COPY PROTECTION)
       MVCURSOR( 70, Y)  CRASH AND BURN (COPY PROTECTION)
       MVCURSOR( 80, Y)  ADJUST RANDOM # (UNTIL KEY IS AVAILABLE)
                                      $47A, $47B, $47C, $47D  (???)
                           RNG USES:  $47A, $4FA, $57A, $5FB  (!!!)  *)
       
                    
PROCEDURE PRGRCHR( VAR A1: TCHRIMAG); EXTERNAL; (* P010020 *)

  (* PRINT A CHARACTER TO HI RES SCREEN *)

(* ---------- END EXTERNALS --------------------- *)

(* ---------- BEGIN SEGMENTS -------------------- *)

(*$I WIZ1C:UTILITIE  *)
(*$I WIZ1B:UTILITIE2 *)
(*$I WIZ1B:UTILITIE3 *)

(*$I WIZ1B:SHOPS     *)
(*$I WIZ1A:SHOPS2    *)

(*$I WIZ1B:SPECIALS  *)
(*$I WIZ1B:SPECIALS2 *)

(*$I WIZ1B:COMBAT    *)
(*$I WIZ1B:COMBAT2   *)
(*$I WIZ1B:COMBAT3   *)
(*$I WIZ1B:COMBAT4   *)
(*$I WIZ1B:COMBAT5   *)

(*$I WIZ1C:CASTLE    *)
(*$I WIZ1C:CASTLE2   *)
                      
(*$I WIZ1C:ROLLER    *)

(*$I WIZ1C:CAMP      *)
(*$I WIZ1C:CAMP2     *)
                        
(*$I WIZ1C:REWARDS   *)
(*$I WIZ1C:REWARDS2  *)
                      
(*$I WIZ1C:RUNNER    *)
(*$I WIZ1C:RUNNER2   *)

(* ---------- END SEGMENTS ---------------------- *)

(*$I WIZ1A:WIZ2.TEXT *)

(* ----- BEGIN WIZARDRY MAINLINE ----- *)

BEGIN  (* P010001 *)
  
  MEMPTR.I := 16384;  (* $4000 *)
  RELEASE( MEMPTR.P);
  
  REPEAT
    LLBASE04 := -1;
    SPECIALS;
    REPEAT
      CASE XGOTO OF
      
       XSCNMSG,
       XINSAREA:  SPECIALS;
       
       XCASTLE,
       XGILGAMS:  CASTLE;
       
       XBOLTAC,
       XCANT,
       XCHK4WIN,
       XCEMETRY,
       XEDGTOWN:  SHOPS;
       
       XNEWMAZE,
       XEQUIP6,
       XEQPDSP,
       XREORDER,
       XCMP2EQ6,
       XCAMPSTF:  UTILITIE;
       
       XTRAININ,
       XBCK2ROL:  ROLLER;
       
       XRUNNER:   RUNNER;
       
       XREWARD,
       XREWARD2:  REWARDS;
       
       XCOMBAT,
       XUNUSED:   COMBAT;
       
       XINSPECT,
       XINSPCT2,
       XINSPCT3,
       XBCK2CMP,
       XBK2CMP2:  CAMP;
       
      END;
    UNTIL XGOTO = XDONE;
    
    WRITE( CHR( 12));
    GOTOXY( 0, 10);
    WRITE( '    PRESS [RETURN] FOR MORE WIZARDRY    ');
    READLN
  UNTIL FALSE
END.

(* ========================================================================== *)
(* DISK: Wiz1C.DSK | FILE: UTILITIE.TEXT                               *)
(* ========================================================================== *)


SEGMENT PROCEDURE UTILITIE;  (* P010101 *)

  VAR
       CHARI : INTEGER;
       CHARX : INTEGER;  (* MULTIPLE USES   SVBASE04, SAVBASE4, ETC.
                                            SAVECAST, ETC. *)
       EQUIPALL : BOOLEAN;


  PROCEDURE RDSPELLS;  (* P010102 *)
  
    CONST
         SCNMAGE = 4;
         SCNPRST = 5;
  
    VAR
         SPELLGRP : INTEGER;
         SPLISTX  : INTEGER;
         DSKSPLNM : INTEGER;
         SPELLX   : INTEGER;
         
         
    PROCEDURE LISTSPLS;  (* P010103 *)
    
      VAR
           SPELLNM : STRING;
           CHPTR   : INTEGER;
           
           
      PROCEDURE PRSPELL( SPELLNM: STRING);  (* P010104 *)
      
        BEGIN
          IF SPELLNM[ 1] = '*' THEN
            BEGIN
              SPELLNM := COPY( SPELLNM, 2, LENGTH( SPELLNM) - 1);
              SPLISTX := SPLISTX + 1
            END;
          GOTOXY( 10 * (SPLISTX DIV 20), 2 + SPLISTX MOD 20);
          IF CHARACTR[ CHARX].SPELLSKN[ SPELLX] THEN
            BEGIN
              WRITE( SPELLNM);
              SPLISTX := SPLISTX + 1
            END;
          SPELLX := SPELLX + 1
        END;  (* PRSPELL *)
        
        
      PROCEDURE SPRETURN;  (* P010105 *)
      
        BEGIN
          GOTOXY( 0, 23);
          WRITE( 'L)EAVE WHEN READY');
          REPEAT
            GOTOXY( 41, 0);
            GETKEY
          UNTIL INCHAR = 'L';
          INCHAR := CHR( 0)
        END;  (* SPRETURN *)
      
      
      BEGIN  (* LISTSPLS *)
        MOVELEFT( IOCACHE[ GETREC( ZZERO, 0, SIZEOF( TSCNTOC))],
                  SCNTOC,
                  SIZEOF( TSCNTOC));
        UNITREAD( DRIVE1, IOCACHE, BLOCKSZ, SCNTOCBL + DSKSPLNM, 0);
        CHPTR := 0;
        SPLISTX := 0;
        WHILE IOCACHE[ CHPTR] <> CHR( CRETURN) DO
          BEGIN
            LLBASE04 := 0;
            WHILE IOCACHE[ CHPTR] <> CHR( CRETURN) DO
              BEGIN
                LLBASE04 := LLBASE04 + 1;
                SPELLNM[ LLBASE04] :=  IOCACHE[ CHPTR];
                CHPTR := CHPTR + 1
              END;
            SPELLNM[ 0] := CHR( LLBASE04);
            PRSPELL( SPELLNM);
            CHPTR := CHPTR + 1
          END;
        UNITREAD( DRIVE1, IOCACHE, SIZEOF( IOCACHE), SCNTOCBL, 0);
        SPRETURN
      END;  (* LISTSPLS *)
      
      
    PROCEDURE PRPRIEST;  (* P010106 *)
    
      BEGIN
        WRITE( CHR( 12));
        WRITE( 'KNOWN PRIEST SPELLS');
        DSKSPLNM := SCNPRST;
        SPELLX := 22;
        LISTSPLS
      END;  (* PRPRIEST *)
      
      
    PROCEDURE PRMAGE;  (* P010107 *)
    
      BEGIN
        DSKSPLNM := SCNMAGE;
        SPELLX := 1;
        WRITE( CHR(12));
        WRITE( 'KNOWN MAGE SPELLS');
        LISTSPLS
      END;  (* PRMAGE *)
      
    
    BEGIN  (* RDSPELLS *)
      CHARX := LLBASE04;
      REPEAT
        WRITE( CHR(12));
        WRITE( 'MAGE   SPELLS LEFT = ');
        WRITE( CHARACTR[ CHARX].MAGESP[ 1]);
        SPELLGRP := 1 + 1;
        WHILE SPELLGRP <= 7 DO
          BEGIN
            WRITE( '/');
            WRITE( CHARACTR[ CHARX].MAGESP[ SPELLGRP]);
            SPELLGRP := SPELLGRP + 1
          END;
        WRITELN;
        WRITE( 'PRIEST SPELLS LEFT = ');
        WRITE( CHARACTR[ CHARX].PRIESTSP[ 1]);
        SPELLGRP := 1 + 1;
        WHILE SPELLGRP <= 7 DO
          BEGIN
            WRITE( '/');
            WRITE( CHARACTR[ CHARX].PRIESTSP[ SPELLGRP]);
            SPELLGRP := SPELLGRP + 1
          END;
        WRITELN;
        WRITELN;
        WRITELN( 'YOU MAY SEE M)AGE OR P)RIEST SPELL BOOKS');
        WRITELN( 'OR L)EAVE.' :22);
        GOTOXY( 41, 15);
        GETKEY;
        CASE INCHAR OF
          'M' :  PRMAGE;
          'P' :  PRPRIEST;
        END
      UNTIL INCHAR = 'L';
      INCHAR := CHR( 0);
      XGOTO := XBK2CMP2;
      LLBASE04 := CHARX;
      EXIT( UTILITIE)
    END;  (* RDSPELLS *)
    

  PROCEDURE IDITEM;  (* P010108 *)
  
    VAR
         ITEMX    : INTEGER;
         OBJECT   : TOBJREC;
  
  
    PROCEDURE EXITIDIT;  (* P010109 *)
    
      BEGIN
        LLBASE04 := CHARX;
        EXIT( UTILITIE)
      END;  (* EXITIDIT *)
    
    
    BEGIN (* IDITEM *)
      CHARX := LLBASE04;
      XGOTO := XBK2CMP2;
      REPEAT
        GOTOXY( 0, 18);
        WRITE( CHR(11));
        WRITE( 'IDENTIFY WHAT ITEM (0=EXIT) ? >');
        GETKEY;
        ITEMX := ORD( INCHAR) - ORD( '0');
        IF ITEMX =  0 THEN
          EXITIDIT
      UNTIL (ITEMX > 0) OR (ITEMX <= CHARACTR[ CHARX].POSS.POSSCNT);
      IF CHARACTR[ CHARX].POSS.POSSESS[ ITEMX].IDENTIF THEN
        EXITIDIT;
      CHARACTR[ CHARX].POSS.POSSESS[ ITEMX].IDENTIF :=
        (RANDOM MOD 100) < (10 +  5 * CHARACTR[ CHARX].CHARLEV);
      IF CHARACTR[ CHARX].POSS.POSSESS[ ITEMX].IDENTIF THEN
        CENTSTR( 'SUCCESS!')
      ELSE
        CENTSTR( 'FAILURE');
      IF (RANDOM MOD 100) < (35 - (3 * CHARACTR[ CHARX].CHARLEV)) THEN
        BEGIN
          MOVELEFT( IOCACHE[ GETREC(
                      ZOBJECT,
                      CHARACTR[ CHARX].POSS.POSSESS[ ITEMX].EQINDEX,
                      SIZEOF( TOBJREC))],
                    OBJECT,
                    SIZEOF( TOBJREC));
          CHARACTR[ CHARX].POSS.POSSESS[ ITEMX].CURSED := OBJECT.CURSED;
          XGOTO := XEQPDSP
        END;
      EXITIDIT
    END;  (* IDITEM *)
    
  PROCEDURE KANDIFND;  (* P01010A *)
  
    VAR
        CHARXDSK  : INTEGER;
        LOCSTRING : STRING;
        LOSTCHAR  : TCHAR;
  
  
    PROCEDURE EXITKAND;  (* P01010B *)
    
      BEGIN
        WRITELN;
        WRITELN( 'L)EAVE WHEN READY');
        GOTOXY( 41, 0);
        REPEAT
          GETKEY;
        UNTIL INCHAR = 'L';
        INCHAR := 'A';
        LLBASE04 := CHARX;
        XGOTO := XBK2CMP2;
        EXIT( UTILITIE)
      END;  (* EXITKAND *)
      
      
    PROCEDURE KANDILOC;  (* P01010C *)
    
      BEGIN
        IF LOSTCHAR.STATUS = LOST THEN
          EXIT( KANDILOC);
        IF LOSTCHAR.STATUS < DEAD THEN
          WRITELN( 'STILL WITH US!')
        ELSE
          BEGIN
            IF (LOSTCHAR.LOSTXYL.LOCATION[ 1] = 0) AND
               (LOSTCHAR.LOSTXYL.LOCATION[ 2] = 0) AND
               (LOSTCHAR.LOSTXYL.LOCATION[ 3] = 0)     THEN
              WRITELN( 'IN THE MOURGE')
            ELSE
              IF LOSTCHAR.LOSTXYL.LOCATION[ 3] <= 0 THEN
                BEGIN
                  WRITELN( 'UNREACHABLE!')
                END
              ELSE
                BEGIN
                  WRITE( 'IN THE ');
                  
                  IF LOSTCHAR.LOSTXYL.LOCATION[ 2] > 9 THEN
                    WRITE( 'NORTH ')
                  ELSE
                    WRITE( 'SOUTH ');
                    
                  IF LOSTCHAR.LOSTXYL.LOCATION[ 1] > 9 THEN
                    WRITE( 'EAST')
                  ELSE
                    WRITE( 'WEST');
                    
                  WRITE( ' OF LEVEL ');
                  WRITELN(  LOSTCHAR.LOSTXYL.LOCATION[ 3]);
                END
          END;
        EXITKAND
      END;  (* KANDILOC *)
      
      
    BEGIN  (* KANDIFND *)
      CHARX :=  LLBASE04;
      WRITE( CHR(12));
      WRITELN( 'LOCATE BODIES');
      WRITELN;
      WRITE('FIND WHO ? >');
      GETLINE( LOCSTRING);
      WRITE( CHR(12));
      WRITE( 'THE SOUL OF ');
      WRITE( LOCSTRING);
      WRITELN( ' IS..');
      WRITELN;
      FOR CHARXDSK := 0 TO SCNTOC.RECPERDK[ ZCHAR] - 1 DO
        BEGIN
          MOVELEFT( IOCACHE[ GETREC( ZCHAR, CHARXDSK, SIZEOF( TCHAR))],
                    LOSTCHAR,
                    SIZEOF( TCHAR));
          IF LOSTCHAR.NAME = LOCSTRING THEN
            KANDILOC
        END;
      WRITELN( 'LOST FOREVER!');
      EXITKAND
    END;   (* KANDIFND *)
    

    PROCEDURE DUMAPIC;  (* P01010D *)
    
      BEGIN
        XGOTO := XBK2CMP2;
        IF MAZELEV = 10 THEN
          BEGIN
            WRITE( CHR( 12));
            WRITELN( 'ENCHANTMENTS PREVENT SPELL FROM WORKING');
            EXIT( UTILITIE)
          END;
        CHARX := LLBASE04;
        WRITE( CHR( 12));
        WRITELN( 'PARTY LOCATION:');
        WRITELN;
        WRITE( 'THE PARTY IS FACING ');
        CASE DIRECTIO OF
          0:  WRITELN( 'NORTH.');
          1:  WRITELN( 'EAST.');
          2:  WRITELN( 'SOUTH.');
          3:  WRITELN( 'WEST.');
        END;
        WRITELN;
        WRITE( 'YOU ARE ');
        WRITE( MAZEX);
        WRITELN( ' SQUARES EAST AND');
        WRITE( MAZEY);
        WRITELN( ' SQUARES NORTH OF THE STAIRS');
        WRITE( 'TO THE CASTLE, AND ');
        WRITE( MAZELEV);
        WRITELN( ' LEVELS');
        WRITELN( 'BELOW IT.');
        WRITELN;
        WRITELN( 'L)EAVE WHEN READY');
        REPEAT
          GOTOXY( 41, 0);
          GETKEY
        UNTIL INCHAR = 'L';
        INCHAR := 'A';
        LLBASE04 := CHARX;
        EXIT( UTILITIE)
      END;  (* DUMAPIC *)
  

  PROCEDURE MALOR;    (* P01010E *)
  
    VAR
         DELTAUD  : INTEGER;
         DELTANS  : INTEGER;
         DELTAEW  : INTEGER;
  
  
    PROCEDURE TELEPORT;  (* P01010F *)
    
      PROCEDURE ROCK;  (* P010110 *)
      
        VAR
             X : INTEGER;
      
        BEGIN
          WRITELN( 'YOU LANDED IN SOLID ROCK OUTSIDE THE');
          WRITELN( 'DUNGEON - YOU ARE LOST FOREVER!');
          FOR X := 0 TO PARTYCNT - 1 DO
            BEGIN
              CHARACTR[ X].INMAZE := FALSE;
              CHARACTR[ X].STATUS := LOST
            END;
          XGOTO := XCEMETRY;
          EXIT( UTILITIE)
        END;
              
        
      PROCEDURE VOLCANO;  (* P010111 *)
      
        VAR
             X : INTEGER;
      
        BEGIN
          WRITELN( 'YOU MATERIALIZED IN MID-AIR AND FELL');
          WRITELN( 'TO A PAINFUL DEATH!');
          FOR X := 0 TO PARTYCNT - 1 DO
            IF CHARACTR[ X].STATUS < DEAD THEN
              CHARACTR[ X].STATUS := DEAD;
          MAZELEV := 0;
          XGOTO := XCHK4WIN;
          EXIT( UTILITIE)
        END;
        
        
      PROCEDURE MOAT;   (* P010112 *)
      
        VAR
             X : INTEGER;
      
        BEGIN
          WRITELN( 'YOU APPEARED IN THE CASTLE MOAT AND');
          WRITELN( 'PROBABLY DROWNED!');
          FOR X := 0 TO PARTYCNT - 1 DO
            IF CHARACTR[ X].STATUS < DEAD THEN
              IF (RANDOM MOD 25) > CHARACTR[ X].ATTRIB[ AGILITY] THEN
                CHARACTR[ X].STATUS := DEAD;
          MAZELEV := 0;
          XGOTO := XCHK4WIN;
          EXIT( UTILITIE)
        END;
    
    
      PROCEDURE TOSHOPS;  (* P010113 *)
      
        BEGIN
          XGOTO := XCHK4WIN;
          EXIT( UTILITIE)
        END;
    
    
      PROCEDURE BOUNCE;  (* P010114 *)
      
        BEGIN
          WRITELN( 'YOU BOUNCED BACK TO WHERE YOU WERE!');
          EXIT( UTILITIE)
        END;
    
    
      BEGIN (* TELEPORT *)
        WRITE( CHR(12));
        XGOTO := XNEWMAZE;
        IF MAZELEV + DELTAUD = SCNTOC.RECPERDK[ ZMAZE] THEN
          BOUNCE;
        MAZEX := MAZEX + DELTAEW;
        MAZEY := MAZEY + DELTANS;
        MAZELEV := MAZELEV + DELTAUD;
        IF ( (MAZEX < 0) OR (MAZEX > 19) OR
             (MAZEY < 0) OR (MAZEY > 19) OR
             (MAZELEV > SCNTOC.RECPERDK[ ZMAZE]))
           AND
           (MAZELEV > 0) THEN
            ROCK
        ELSE
          BEGIN
            IF MAZELEV < 0 THEN
              VOLCANO
            ELSE
              IF MAZELEV = 0 THEN
                IF (MAZEX = 0) AND (MAZEY = 0) THEN
                  TOSHOPS
                ELSE
                  MOAT
          END;
        EXIT( UTILITIE)
      END;
  
  
    BEGIN (* MALOR *)
      CHARX := LLBASE04;
      WRITE( CHR(12));
      WRITELN( 'PARTY TELEPORT:');
      WRITELN;
      WRITELN( 'ENTER NSEWU OR D TO  SET DISPLACEMENT,');
      WRITELN( 'THEN [RETURN] TO TELEPORT, OR [ESC] TO');
      WRITELN( 'CHICKEN OUT!');
      WRITELN;
      WRITELN( '# SQUARES EAST  =');
      WRITELN( '# SQUARES NORTH =');
      WRITELN( '# SQUARES DOWN  =');
      DELTAEW := 0;
      DELTANS := 0;
      DELTAUD := 0;
      REPEAT
        GOTOXY( 18, 6);
        WRITE( DELTAEW : 4);
        GOTOXY( 18, 7);
        WRITE( DELTANS : 4);
        GOTOXY( 18, 8);
        WRITE( DELTAUD : 4);
        GOTOXY( 41, 0);
        GETKEY;
        IF INCHAR = CHR( CRETURN) THEN
          TELEPORT
        ELSE
          BEGIN
            CASE INCHAR OF
              'N': DELTANS := DELTANS + 1;
              'S': DELTANS := DELTANS - 1;
              'E': DELTAEW := DELTAEW + 1;
              'W': DELTAEW := DELTAEW - 1;
              'D': DELTAUD := DELTAUD + 1;
              'U': DELTAUD := DELTAUD - 1;
            END
          END
      UNTIL INCHAR = CHR( 27);
      XGOTO := XBK2CMP2;
      LLBASE04 := CHARX;
      EXIT( UTILITIE)
    END;
    

  PROCEDURE NEWMAZE;  (* P010115 *)
  
    VAR
         MAZEMAP  : TMAZE;
         UNUSED   : ARRAY[ 0..2] OF INTEGER;
         
  
    PROCEDURE FIGHTS;  (* P010116 *)
    
      VAR
           FIGHTY : INTEGER;
           FIGHTX : INTEGER;
           Y      : INTEGER;
           X      : INTEGER;
    
    
      PROCEDURE FINDSPOT;  (* P010117 *)
      
        VAR
            Y1 : INTEGER;
            X1 : INTEGER;
      
        BEGIN (* FINDSPOT *)
          X1 := RANDOM MOD 20;
          Y1 := RANDOM MOD 20;
          FIGHTX := X1;
          FIGHTY := Y1;
          REPEAT
            IF MAZEMAP.FIGHTS[ FIGHTX][ FIGHTY] = 1 THEN
              IF NOT (FIGHTMAP[ FIGHTX][ FIGHTY]) THEN
                BEGIN
                  EXIT( FINDSPOT)
                END;
            FIGHTX := FIGHTX + 1;
            IF FIGHTX > 19 THEN
              BEGIN
                FIGHTX := 0;
                FIGHTY := FIGHTY + 1;
                IF FIGHTY > 19 THEN
                  FIGHTY := 0
              END;
          UNTIL (FIGHTX = X1) AND (FIGHTY = Y1);
          EXIT( FIGHTS)
        END;   (* FINDSPOT *)
        
        
      PROCEDURE FILLROOM( X : INTEGER; Y : INTEGER);  (* P010118 *)
        
        BEGIN
        
          X := (X + 20) MOD 20;
          Y := (Y + 20) MOD 20;
          IF (MAZEMAP.FIGHTS[ X][ Y] = 0) OR
             FIGHTMAP[ X][ Y] THEN
             BEGIN
               EXIT( FILLROOM)
             END;
             
          FIGHTMAP[ X][ Y] := TRUE;
          
          IF MAZEMAP.N[ X][ Y] = OPEN THEN
            FILLROOM( X, Y + 1);
            
          IF MAZEMAP.E[ X][ Y] = OPEN THEN
            FILLROOM( X + 1, Y);
            
          IF MAZEMAP.S[ X][ Y] = OPEN THEN
            FILLROOM( X, Y - 1);
            
          IF MAZEMAP.W[ X][ Y] = OPEN THEN
            FILLROOM( X - 1, Y)
            
        END;   (* FILLROOM *)
    
    
      BEGIN (* FIGHTS *)
        FILLCHAR( FIGHTMAP, 80, 0);
        FOR X := 1 TO 9 DO
          BEGIN
            FINDSPOT;
            FILLROOM( FIGHTX, FIGHTY)
          END;
          
        FOR X := 0 TO 19 DO
          BEGIN
            FOR Y := 0 TO 19 DO
              BEGIN
                IF MAZEMAP.SQRETYPE[ MAZEMAP.SQREXTRA[ X][ Y]] = ENCOUNTE THEN
                  FILLROOM( X, Y)
              END;
          END;
      END;  (* FIGHTS *)
  
  
    BEGIN (* NEWMAZE *)
      IF MAZELEV = 0 THEN
        BEGIN
          WRITE( CHR(12));
          XGOTO := XCHK4WIN;
          EXIT( UTILITIE)
        END;
        
      IF MAZELEV < 0 THEN
        BEGIN
          MAZELEV := 1;
          XGOTO := XEQUIP6
        END
      ELSE
        BEGIN
          XGOTO := XRUNNER
        END;
      MOVELEFT( IOCACHE[ GETREC( ZMAZE, MAZELEV - 1, SIZEOF( TMAZE))],
                MAZEMAP,
                SIZEOF( TMAZE));
      FIGHTS;
      CLRRECT( 1, 11, 38, 4);
      EXIT( UTILITIE)
    END;  (* NEWMAZE *)
    

(* ========================================================================== *)
(* DISK: Wiz1B.DSK | FILE: UTILITIE2.TEXT                              *)
(* ========================================================================== *)


PROCEDURE EQUIPCHR( CHARI : INTEGER);  (* P010119 *)
    
    VAR
         UNARMED  : BOOLEAN;
         CANUSE   : ARRAY[ TOBJTYPE] OF BOOLEAN;
         UNUSED   : BOOLEAN;
         TEMPX    : INTEGER; (* MULTIPLE USES *)
         POSSI    : INTEGER;
         POSSCNT  : INTEGER;
         LUCKI    : INTEGER;
         OBJI     : TOBJTYPE;
         OBJECT   : TOBJREC;
         OBJLIST  : ARRAY[ 1..8] OF INTEGER;
         
    
    PROCEDURE CHSPCPOW;  (* P01011A *)
      
      
        PROCEDURE SPCPOWER;  (* P01011B *)
        
          VAR
               SPCTEMP  : INTEGER;
               GOLD50K  : TWIZLONG;
        
        
          PROCEDURE SPC1TO12( ATTR2MOD: INTEGER;  (* P01011C *)
                              MODAMT:   INTEGER);
          
            VAR
                 ATTRX : TATTRIB;
          
            BEGIN
              ATTRX := STRENGTH;
              WHILE ATTR2MOD > 1 DO
                BEGIN
                  ATTRX := SUCC( ATTRX);
                  ATTR2MOD := ATTR2MOD - 1
                END;
              SPCTEMP := CHARACTR[ CHARI].ATTRIB[ ATTRX] + MODAMT;
              IF (SPCTEMP > 2) AND (SPCTEMP < 19) THEN
                CHARACTR[ CHARI].ATTRIB[ ATTRX] := SPCTEMP;
            END;
          
        
          BEGIN  (* SPCPOWER *)
            FILLCHAR( GOLD50K, 6, 0);
            GOLD50K.MID := 5;
            WRITE( CHR( 12));
            WRITELN( 'WILL YOU INVOKE THE SPECIAL POWER OF');
            WRITE( 'YOUR ');
            IF CHARACTR[ CHARI].POSS.POSSESS[ POSSI].IDENTIF THEN
              WRITE( OBJECT.NAME)
            ELSE
              WRITE( OBJECT.NAMEUNK);
            WRITE( ' (Y/N) ? >');
            REPEAT
              GETKEY
            UNTIL (INCHAR = 'Y') OR (INCHAR = 'N');
            IF INCHAR = 'N' THEN
              EXIT( SPCPOWER);
            IF (RANDOM MOD 100) < OBJECT.CHGCHANC THEN
              CHARACTR[ CHARI].POSS.POSSESS[ POSSI].EQINDEX :=
                OBJECT.CHANGETO;
            IF OBJECT.SPECIAL < 7 THEN
              BEGIN
                SPC1TO12( OBJECT.SPECIAL, 1)
              END
            ELSE
              BEGIN
                IF OBJECT.SPECIAL < 13 THEN
                  SPC1TO12( OBJECT.SPECIAL - 6, - 1)
                ELSE 
                  BEGIN
                    WITH CHARACTR[ CHARI] DO
                      BEGIN
                        CASE OBJECT.SPECIAL OF
                          13: IF AGE > 1040 THEN
                                AGE := AGE - 52;
                          14: AGE := AGE + 52;
                          15: CLASS := SAMURAI;
                          16: CLASS := LORD;
                          17: CLASS := NINJA;
                          18: ADDLONGS( GOLD, GOLD50K);
                          19: ADDLONGS( EXP, GOLD50K);
                          20: STATUS := LOST;
                          21: BEGIN
                                STATUS := OK;
                                HPLEFT := HPMAX;
                                LOSTXYL.POISNAMT[ 1] := 0
                              END;
                          22: HPMAX := HPMAX + 1;
                          23: BEGIN
                                (* LOOKS LIKE BUG!  PARTYCNT - 1  !!! *)
                                FOR SPCTEMP := 0 TO PARTYCNT DO
                                    CHARACTR[ SPCTEMP].HPLEFT :=
                                      CHARACTR[ SPCTEMP].HPMAX
                              END;
                        END
                    END
                  END
              END;
          END;  (* SPCPOWER *)
      
      
        BEGIN (* CHSPCPOW *)
          FOR POSSI := 1 TO CHARACTR[ CHARI].POSS.POSSCNT DO
            IF CHARACTR[ CHARI].POSS.POSSESS[ POSSI].EQINDEX > 0 THEN
              BEGIN
                MOVELEFT( IOCACHE[ GETREC( 
                            ZOBJECT,
                            CHARACTR[ CHARI].POSS.POSSESS[ POSSI].EQINDEX,
                            SIZEOF( TOBJREC))],
                          OBJECT,
                          SIZEOF( TOBJREC));
                IF OBJECT.SPECIAL > 0 THEN
                  SPCPOWER
              END;
        END;
    
    
      PROCEDURE NORMPOW;  (* P01011D *)
      
        VAR
             TEMPX : INTEGER;
             TEMPY : INTEGER;
             POSSX : INTEGER;
      
        BEGIN
          FILLCHAR( CANUSE, 14, 0);
          FOR POSSX := 1 TO CHARACTR[ CHARI].POSS.POSSCNT DO
            BEGIN
              MOVELEFT( IOCACHE[ GETREC( ZOBJECT,
                                         CHARACTR[ CHARI].
                                           POSS.POSSESS[ POSSX].EQINDEX,
                                         SIZEOF( TOBJREC))],
                        OBJECT,
                        SIZEOF( TOBJREC));
              IF OBJECT.CLASSUSE[ CHARACTR[ CHARI].CLASS] THEN
                CANUSE[ OBJECT.OBJTYPE] := TRUE;
              IF CHARACTR[ CHARI].HEALPTS < OBJECT.HEALPTS THEN
                CHARACTR[ CHARI].HEALPTS := OBJECT.HEALPTS;
              FOR TEMPX := 0 TO 13 DO
                CHARACTR[ CHARI].WEPVSTY2[ 0][ TEMPX] :=
                CHARACTR[ CHARI].WEPVSTY2[ 0][ TEMPX] OR OBJECT.WEPVSTY2[ TEMPX];
              FOR TEMPY := 0 TO 6 DO
                CHARACTR[ CHARI].WEPVSTY3[ 0][ TEMPY] :=
                CHARACTR[ CHARI].WEPVSTY3[ 0][ TEMPY] OR OBJECT.WEPVSTY3[ TEMPY]
            END
        END;  (* NORMPOW *)
        
        
      PROCEDURE ARMORPOW( CHARX: INTEGER;  (* P01011E *)
                          POSSX: INTEGER;
                          OBJID: INTEGER);
      
        VAR
             MP04XX : INTEGER;  (* UNUSED *)
      
        BEGIN
          UNARMED := FALSE;
          MOVELEFT( IOCACHE[ GETREC( ZOBJECT,
                                     OBJID,
                                     SIZEOF( TOBJREC))],
                    OBJECT,
                    SIZEOF( TOBJREC));
          WITH CHARACTR[ CHARX] DO
            BEGIN
              POSS.POSSESS[ POSSX].CURSED := OBJECT.CURSED;
              IF (OBJECT.ALIGN = UNALIGN) OR (OBJECT.ALIGN = ALIGN) THEN
                BEGIN
                  IF OBJECT.XTRASWNG > SWINGCNT THEN
                    SWINGCNT := OBJECT.XTRASWNG;
                  ARMORCL := ARMORCL - OBJECT.ARMORMOD;
                  HPCALCMD := HPCALCMD + OBJECT.WEPHITMD;
                  IF OBJECT.OBJTYPE = WEAPON THEN
                    BEGIN
                      LLBASE04 := HPDAMRC.HPMINAD;
                      HPDAMRC := OBJECT.WEPHPDAM;
                      HPDAMRC.HPMINAD := HPDAMRC.HPMINAD + LLBASE04;
                      CRITHITM := CRITHITM OR OBJECT.CRITHITM;
                      WEPVSTYP := OBJECT.WEPVSTYP
                    END
                END
              ELSE
                BEGIN
                  HPCALCMD := HPCALCMD - 1;
                  ARMORCL := ARMORCL + 1;
                  CRITHITM := FALSE;
                  POSS.POSSESS[ POSSX].CURSED := TRUE
                END
            END;
        END;  (* ARMORPOW *)
        
        
      PROCEDURE ARM4CHAR;  (* P01011F *)
      
      VAR
           POSSX : INTEGER;
      
        BEGIN
          FOR POSSX := 1 TO CHARACTR[ CHARI].POSS.POSSCNT DO
            IF CHARACTR[ CHARI].POSS.POSSESS[ POSSX].EQUIPED THEN
              ARMORPOW( CHARI, POSSX,
                                 CHARACTR[ CHARI].POSS.POSSESS[ POSSX].EQINDEX)
        END;
        
        
      PROCEDURE DOEQUIP;  (* P010120 *)
      
      
        PROCEDURE EQUIPONE;  (* P010121 *)
        
          BEGIN
            REPEAT
              GOTOXY( 0, 15);
              WRITE( CHR( 11));
              WRITE( 'WHICH ONE ([RET] FOR NONE) ? >');
              GETKEY;
              IF INCHAR = CHR( CRETURN) THEN
                EXIT( EQUIPONE);
              POSSI := ORD( INCHAR) - ORD( '0')
            UNTIL (POSSI > 0) AND (POSSI <= POSSCNT);
            CHARACTR[ CHARI].POSS.POSSESS[ OBJLIST[ POSSI]].EQUIPED := TRUE;
            ARMORPOW( CHARI,
                      OBJLIST[ POSSI],
                      CHARACTR[ CHARI].POSS.POSSESS[ OBJLIST[ POSSI]].EQINDEX)
          END;  (* EQUIPONE *)
      
      
        PROCEDURE CURSBELL( CURSSTR : STRING);  (* P010122 *)
        
          VAR
               X : INTEGER;
        
          BEGIN
            FOR X := 1 TO LENGTH( CURSSTR) DO
              BEGIN
                WRITE( CURSSTR[ X]);
                WRITE( CHR( 7));
                WRITE( CHR( 7))
              END;
          END;
        
        
        BEGIN (* DOEQUIP *)
          IF NOT CANUSE[ OBJI] THEN
            EXIT (DOEQUIP);
          WRITE( CHR( 12));
          WRITE( 'SELECT ');
          CASE OBJI OF
              WEAPON : WRITE( 'WEAPON');
               ARMOR : WRITE( 'ARMOR');
              SHIELD : WRITE( 'SHIELD');
              HELMET : WRITE( 'HELMET');
            GAUNTLET : WRITE( 'GAUNTLETS');
                MISC : WRITE( 'MISC. ITEM');
          END;
          WRITE( ' FOR ');
          WRITELN( CHARACTR[ CHARI].NAME);
          WRITELN;
          WRITELN;
          POSSCNT := 0;
          FOR POSSI := 1 TO CHARACTR[ CHARI].POSS.POSSCNT DO
            BEGIN
              IF CHARACTR[ CHARI].POSS.POSSESS[ POSSI].EQINDEX > 0 THEN
                BEGIN
                  MOVELEFT( IOCACHE[ GETREC(
                                ZOBJECT,
                                CHARACTR[ CHARI].POSS.POSSESS[ POSSI].EQINDEX,
                                SIZEOF( TOBJREC))],
                            OBJECT,
                            SIZEOF( TOBJREC));
                  IF (OBJECT.OBJTYPE = OBJI) AND
                     (OBJECT.CLASSUSE[ CHARACTR[ CHARI].CLASS]) THEN
                    BEGIN
                      POSSCNT := POSSCNT + 1;
                      OBJLIST[ POSSCNT] := POSSI;
                      WRITE( ' ' :10);
                      WRITE( POSSCNT : 1);
                      WRITE( ')');
                      IF CHARACTR[ CHARI].POSS.POSSESS[ POSSI].CURSED THEN
                        WRITE( '-')
                      ELSE IF CHARACTR[ CHARI].POSS.POSSESS[ POSSI].IDENTIF
                                                                         THEN
                        WRITE( ' ')
                      ELSE
                        WRITE( '?');
                      IF CHARACTR[ CHARI].POSS.POSSESS[ POSSI].IDENTIF THEN
                        WRITELN( OBJECT.NAME)
                      ELSE
                        WRITELN( OBJECT.NAMEUNK);
                    END
                END
            END;
            
            TEMPX := 0;
            FOR POSSI := 1 TO POSSCNT DO
              IF CHARACTR[ CHARI].POSS.POSSESS[ OBJLIST[ POSSI]].CURSED THEN
                TEMPX := POSSI;
            IF TEMPX = 0 THEN
              EQUIPONE;
              
            TEMPX := 0;
            FOR POSSI := 1 TO POSSCNT DO
              IF CHARACTR[ CHARI].POSS.POSSESS[ OBJLIST[ POSSI]].CURSED THEN
                TEMPX := POSSI;
            IF TEMPX > 0 THEN
              BEGIN
                GOTOXY( 7, 23);
                CURSBELL( '** CURSED **');
                CHARACTR[ CHARI].POSS.POSSESS[ OBJLIST[ TEMPX]].EQUIPED :=
                                                                          TRUE;
                ARMORPOW( CHARI,
                          OBJLIST[ TEMPX],
                       CHARACTR[ CHARI].POSS.POSSESS[ OBJLIST[ TEMPX]].EQINDEX)
              END
        END;  (* DOEQUIP *)
        
        
      PROCEDURE UPLCKSKL( LSSUB:    INTEGER;  (* P010123 *)
                          LSMODAMT: INTEGER);
      
        BEGIN
          LSMODAMT := CHARACTR[ CHARI].LUCKSKIL[ LSSUB] - LSMODAMT;
          IF LSMODAMT < 1 THEN
            LSMODAMT := 1;
          CHARACTR[ CHARI].LUCKSKIL[ LSSUB] := LSMODAMT
        END;
        
        
      PROCEDURE INITSTUF;  (* P010124 *)
      
        VAR
             X : INTEGER;
             Y : INTEGER;
      
        BEGIN
          WITH CHARACTR[ CHARI] DO
            BEGIN
              FOR X := 0 TO 13 DO
                BEGIN
                  WEPVSTY2[ 0][ X] := FALSE;
                  WEPVSTY2[ 1][ X] := FALSE;
                  WEPVSTYP[ X] := FALSE
                END;
              FOR Y := 0 TO 6 DO
                BEGIN
                  WEPVSTY3[ 0][ Y] := FALSE;
                  WEPVSTY3[ 1][ Y] := FALSE
                END
            END
        END;
        
        
      BEGIN  (* EQUIPCHR *)
        WITH CHARACTR[ CHARI] DO
          BEGIN
            TEMPX := (20 - CHARLEV DIV 5) - (ATTRIB[ LUCK] DIV 6);
            IF TEMPX < 1 THEN
              TEMPX := 1;
            FOR LUCKI := 0 TO 4 DO
              LUCKSKIL[ LUCKI] := TEMPX;
              
            CASE CLASS OF
            
              FIGHTER :   UPLCKSKL( 0, 3);
                 MAGE :   UPLCKSKL( 4, 3);
               PRIEST :   UPLCKSKL( 1, 3);
                THIEF :   UPLCKSKL( 3, 3);
                
               BISHOP : BEGIN
                          UPLCKSKL( 2, 2);
                          UPLCKSKL( 4, 2);
                          UPLCKSKL( 1, 2);
                        END;
                        
              SAMURAI : BEGIN
                          UPLCKSKL( 0, 2);
                          UPLCKSKL( 4, 2);
                        END;
                        
                 LORD : BEGIN
                          UPLCKSKL( 0, 2);
                          UPLCKSKL( 1, 2);
                        END;
                          
                NINJA : BEGIN
                          UPLCKSKL( 0, 3);
                          UPLCKSKL( 1, 2);
                          UPLCKSKL( 2, 4);
                          UPLCKSKL( 3, 3);
                          UPLCKSKL( 4, 2);
                        END;
               
            END;
            
            CASE RACE OF
               HUMAN:  UPLCKSKL( 0, 1);
                 ELF:  UPLCKSKL( 2, 2);
               DWARF:  UPLCKSKL( 3, 4);
               GNOME:  UPLCKSKL( 1, 2);
              HOBBIT:  UPLCKSKL( 4, 3);
            END;
            
            IF NOT EQUIPALL THEN
              FOR TEMPX := 1 TO 8 DO
                POSS.POSSESS[ TEMPX].EQUIPED := FALSE;
            
            IF (CLASS = PRIEST) OR
               (CLASS = FIGHTER) OR
               (CLASS >= SAMURAI) THEN
              HPCALCMD := 2 + CHARLEV DIV 3
            ELSE
              HPCALCMD := CHARLEV DIV 5;
            
            HPDAMRC.LEVEL   := 2;
            HPDAMRC.HPFAC   := 2;
            HPDAMRC.HPMINAD := 0;
            
            IF ATTRIB[ STRENGTH] > 15 THEN
              BEGIN
                HPCALCMD := HPCALCMD + ATTRIB[ STRENGTH] - 15;
                HPDAMRC.HPMINAD := ATTRIB[ STRENGTH] - 15
              END
            ELSE
              IF ATTRIB[ STRENGTH] < 6 THEN
                HPCALCMD := HPCALCMD + ATTRIB[ STRENGTH] - 6;
            
            HEALPTS := 0;
            
            CRITHITM := CLASS = NINJA;
            
            SWINGCNT := 1;
            
            IF CLASS = NINJA THEN
              HPDAMRC.HPFAC := 4;
              
            ARMORCL := 10;
              
            IF (CLASS = FIGHTER) OR
               (CLASS >= SAMURAI) THEN
              SWINGCNT := SWINGCNT + (CHARLEV DIV 5) + ORD( (CLASS = NINJA)); 
              
            IF SWINGCNT > 10 THEN
              SWINGCNT := 10;
              
            INITSTUF;
            NORMPOW;
            UNARMED := TRUE
          END;
            
          IF NOT EQUIPALL THEN
            BEGIN
              FOR OBJI := WEAPON TO GAUNTLET DO
                DOEQUIP;
              OBJI := MISC;
              DOEQUIP;
              CHSPCPOW
            END
          ELSE
            ARM4CHAR;
          
          IF CHARACTR[ CHARI].CLASS = NINJA THEN
            IF UNARMED THEN
              CHARACTR[ CHARI].ARMORCL := (CHARACTR[ CHARI].ARMORCL -
                (CHARACTR[ CHARI].CHARLEV DIV 3)) - 2
      END;  (* EQUIPCHR *)



    PROCEDURE EQUIP6;  (* P010125 *)
    
      VAR
           PARTYX : INTEGER;
           
      BEGIN
        EQUIPALL := TRUE;
        FOR PARTYX := 0 TO (PARTYCNT - 1) DO
          EQUIPCHR( PARTYX);
        IF XGOTO = XEQUIP6 THEN
          XGOTO := XINSPCT2
        ELSE
          BEGIN
            XGOTO := XRUNNER;
            GRAPHICS
          END
      END;
      
      
    PROCEDURE EQUIP1( CHARX : INTEGER);  (* P010126 *)
    
      BEGIN
        EQUIPALL := FALSE;
        EQUIPCHR( CHARX);
        XGOTO := XBCK2CMP;
        LLBASE04 := CHARX
      END;
      
      

    PROCEDURE REORDER;  (* P010127 *)
    
      VAR
           SWITCH   : INTEGER;
           PARTYNUM : INTEGER;
           PARTYX   : INTEGER;
           CHARREC  : TCHAR;
           DONE     : BOOLEAN;
           LIST     : ARRAY[ 0..5] OF INTEGER;
           
      BEGIN
        XGOTO := XINSPCT2;
        IF PARTYCNT < 2 THEN
          EXIT( REORDER);
        GOTOXY( 0, 11);
        WRITE( CHR( 11));
        WRITE( 'REORDERING' :25);
        FOR PARTYX := 0 TO PARTYCNT - 1 DO
          BEGIN
            LIST[ PARTYX] := 99;
            GOTOXY( 0, 13 + PARTYX);
            WRITE( (PARTYX + 1) :1);
            WRITE( ')')
          END;
        FOR PARTYX := 0 TO PARTYCNT - 2 DO
          BEGIN
            REPEAT
              DONE := FALSE;
              GOTOXY( 1, 13 + PARTYX);
              WRITE( '   ');
              GOTOXY( 1, 13 + PARTYX);
              WRITE( '>>');
              GETKEY;
              PARTYNUM := ORD( INCHAR) - ORD( '1');
              IF (PARTYNUM >= 0) AND (PARTYNUM < PARTYCNT) THEN
                IF LIST[ PARTYNUM] = 99 THEN
                  BEGIN
                    LIST[ PARTYNUM] := PARTYX;
                    DONE := TRUE
                  END
            UNTIL DONE;
            GOTOXY( 1, 13 + PARTYX);
            WRITE( ') ');
            WRITE( CHARACTR[ PARTYNUM].NAME)
          END;
        FOR PARTYX := 0 TO PARTYCNT - 2 DO
          FOR PARTYNUM := PARTYX + 1 TO PARTYCNT - 1 DO
            IF LIST[ PARTYNUM] < LIST[ PARTYX] THEN
              BEGIN
                CHARREC := CHARACTR[ PARTYX];
                CHARACTR[ PARTYX] := CHARACTR[ PARTYNUM];
                CHARACTR[ PARTYNUM] := CHARREC;
                SWITCH := CHARDISK[ PARTYX];
                CHARDISK[ PARTYX] := CHARDISK[ PARTYNUM];
                CHARDISK[ PARTYNUM] := SWITCH;
                SWITCH := LIST[ PARTYX];
                LIST[ PARTYX] := LIST[ PARTYNUM];
                LIST[ PARTYNUM] := SWITCH
              END;
        GOTOXY( 1, 13 + PARTYCNT - 1);
        WRITE( ') ');
        WRITE( CHARACTR[ PARTYCNT - 1].NAME)
      END; (* REORDER *)


(* ========================================================================== *)
(* DISK: Wiz1B.DSK | FILE: UTILITIE3.TEXT                              *)
(* ========================================================================== *)

    
  BEGIN (* UTILITIE *)
  
    IF XGOTO <> XNEWMAZE THEN
      TEXTMODE;
      
    CASE XGOTO OF
    
      XCAMPSTF:
                CASE BASE12.GOTOX OF
                  XDONE    : RDSPELLS;
                  XTRAININ : IDITEM;
                  XCASTLE  : KANDIFND;
                  XGILGAMS : DUMAPIC;
                  XINSPECT : MALOR;
                END;
        
      XNEWMAZE:  NEWMAZE;
      
      XEQUIP6,
      XCMP2EQ6:  EQUIP6;
      
      XREORDER:  REORDER;
      
      XEQPDSP:   IF LLBASE04 >= 0 THEN
                   EQUIP1( LLBASE04)
                 ELSE
                   BEGIN
                     FOR CHARI := 0 TO PARTYCNT - 1 DO
                       EQUIP1( CHARI);
                     XGOTO := XINSPCT2
                   END;
    END;

  END; (* UTILITIE *)

(* ========================================================================== *)
(* DISK: Wiz1B.DSK | FILE: SHOPS.TEXT                                  *)
(* ========================================================================== *)

  
SEGMENT PROCEDURE SHOPS;  (* P010201 *)
  
    PROCEDURE CANT;  (* P010202 *)
    
      VAR
           WHOHELP  : INTEGER;
           UNUSEDXX : INTEGER;
           WHOPAY   : INTEGER;
           WHOHELPX : INTEGER;
           DISABLED : STRING;
           WHO      : TCHAR;
    
      
      PROCEDURE CANTSHOP;  (* P010203 *)
      
      
        PROCEDURE DSP2STR( STR1: STRING; STR2: STRING);  (* P010204 *)
        
          BEGIN
            CENTSTR( CONCAT('** ', STR1, STR2, ' **') );
            EXIT( CANTSHOP)
          END;
          
          
        PROCEDURE WELCOME;  (* P010205 *)
        
          BEGIN
            GOTOXY( 0, 13);
            WRITE( CHR( 11));
            WRITELN( ' WELCOME TO THE TEMPLE OF RADIANT CANT!');
            WRITELN;
            WRITE( 'WHO ARE YOU HELPING ? >');
            GETLINE( DISABLED);
            IF DISABLED = '' THEN
              EXIT( CANT);
            WHOHELPX := 0;
            MOVELEFT( IOCACHE[ GETREC( ZCHAR, WHOHELPX, SIZEOF( TCHAR))],
                      WHO,
                      SIZEOF( TCHAR));
            WHILE (WHOHELPX < SCNTOC.RECPERDK[ ZCHAR]) AND
                  (DISABLED <> WHO.NAME) DO
              BEGIN
                WHOHELPX := WHOHELPX + 1;
                MOVELEFT( IOCACHE[ GETREC( ZCHAR, WHOHELPX, SIZEOF( TCHAR))],
                          WHO,
                          SIZEOF( TCHAR))
              END;
            IF WHOHELPX = SCNTOC.RECPERDK[ ZCHAR] THEN
              DSP2STR( '', 'WHO?');
            
            IF ((WHO.LOSTXYL.LOCATION[ 1] +
                 WHO.LOSTXYL.LOCATION[ 2] +
                 WHO.LOSTXYL.LOCATION[ 3] ) <> 0)
                     OR
                 WHO.INMAZE THEN
              DSP2STR( WHO.NAME, ' IS NOT HERE');
            IF WHO.STATUS = LOST THEN
              DSP2STR( WHO.NAME, ' IS LOST');
            IF WHO.STATUS = OK THEN
              DSP2STR( WHO.NAME, ' IS OK');
            WHOHELP := WHOHELPX
          END;
          
          
        PROCEDURE PAYCANT;  (* P010206 *)
        
          VAR
               PAYAMT : TWIZLONG;
        
        
          PROCEDURE GETPAYER;  (* P010207 *)
          
            BEGIN
              PAYAMT.HIGH := 0;
              PAYAMT.MID := 0;
              CASE WHO.STATUS OF
                PLYZE  : PAYAMT.LOW := 100;
                STONED : PAYAMT.LOW := 200;
                DEAD   : PAYAMT.LOW := 250;
                ASHES  : PAYAMT.LOW := 500;
              END;
              MULTLONG( PAYAMT, WHO.CHARLEV);
              GOTOXY( 0, 17);
              WRITE( CHR( 11));
              WRITE( 'THE DONATION WILL BE ');
              PRNTLONG( PAYAMT);
              WRITELN;
              WHOPAY := GETCHARX( FALSE, 'WHO WILL TITHE');
              IF WHOPAY = -1 THEN
                EXIT( CANTSHOP);
              IF TESTLONG( PAYAMT, CHARACTR[ WHOPAY].GOLD) > 0 THEN
                DSP2STR( '', 'CHEAP APOSTATES! OUT!');
              SUBLONGS( CHARACTR[ WHOPAY].GOLD, PAYAMT)
            END;
            
            
          PROCEDURE DOCANT;  (* P010208 *)
          
          
            PROCEDURE ASHLOST;  (* P010209 *)
            
              BEGIN
                IF WHO.STATUS = DEAD THEN
                  WHO.STATUS := ASHES
                ELSE
                  WHO.STATUS := LOST;
                WHO.INMAZE := FALSE;
                MOVELEFT( WHO,
                          IOCACHE[ GETRECW( ZCHAR, WHOHELP, SIZEOF( TCHAR))],
                          SIZEOF( TCHAR));
                WRITELN;
                IF WHO.STATUS = LOST THEN
                  DSP2STR( WHO.NAME, ' WILL BE BURIED') 
                ELSE
                  DSP2STR( WHO.NAME, ' NEEDS KADORTO NOW')
              END; (* ASHLOST *)
              
              
            BEGIN (* DOCANT *)
              GOTOXY( 0, 17);
              WRITE( CHR( 11));
              WRITE( 'MURMUR - ');
              PAUSE2;
              WRITE( 'CHANT - ');
              PAUSE2;
              WRITE( 'PRAY - ');
              PAUSE2;
              WRITE( 'INVOKE!');
              WRITELN;
              
              IF WHO.STATUS = DEAD THEN
                BEGIN
                  IF (RANDOM MOD 100) > (50 + 3 * WHO.ATTRIB[ VITALITY]) THEN
                    ASHLOST
                  ELSE
                    WHO.HPLEFT := 1
                END
              ELSE IF WHO.STATUS = ASHES THEN
                BEGIN
                  IF (RANDOM MOD 100) > (40 + 3 * WHO.ATTRIB[ VITALITY]) THEN
                    ASHLOST
                  ELSE
                    WHO.HPLEFT := WHO.HPMAX
                END;
                
              WHO.AGE := WHO.AGE + (RANDOM MOD 52) + 1;
              WHO.STATUS := OK;
              MOVELEFT( WHO, 
                        IOCACHE[ GETRECW( ZCHAR, WHOHELP, SIZEOF( TCHAR))],
                        SIZEOF( TCHAR));
              WRITELN;
              DSP2STR( WHO.NAME, ' IS WELL')
            END;
            
            
          BEGIN (* PAYCANT *)
            GETPAYER;
            DOCANT
          END;
          
          
        BEGIN (* CANTSHOP *)
          WELCOME;
          PAYCANT
        END;
        
        
      BEGIN (* CANT *)
        XGOTO := XCASTLE;
        REPEAT
          CANTSHOP
        UNTIL FALSE;
        EXIT( SHOPS)
      END; (* CANT *)
  
  
    PROCEDURE BOLTAC;  (* P01020A *)
    
      VAR
           INVENTX  : INTEGER;
           HALFPRIC : INTEGER;
           OBJECT   : TOBJREC;
           CHARI    : INTEGER;
           UNUSEDXX : ARRAY[ 1..41] OF INTEGER;
           
           
      PROCEDURE DOPLAYER;  (* P01020B *)
      
        CONST
        
        (* ACTION *)
             SELL     = 0;
             UNCURSE  = 1;
             IDENTIFY = 2;
             BUY      = 3;
             POOLGOLD = 4;
             LEAVE    = 5;
      
        VAR
            OBJLIST  : ARRAY[ 1..6] OF INTEGER;
            UNUSEDXX : INTEGER;
            UNUSEDYY : INTEGER;
            POSSCNT  : INTEGER;
      
      
        PROCEDURE DOBUY;  (* P01020C *)
        
          VAR
               NOTPURCH : BOOLEAN;
               SCROLDIR : INTEGER;
               BUYX     : INTEGER;
        
            
          PROCEDURE SCROLPOS;  (* P01020D *)
          
            VAR
                 X : INTEGER;
          
            BEGIN
              INVENTX := OBJLIST[ 6] - 1;
              FOR X := 1 TO 6 DO
                BEGIN
                  GOTOXY( 0, 12 + X);
                  WRITE( CHR( 29));
                  REPEAT
                    INVENTX := INVENTX + 1;
                    IF INVENTX >= SCNTOC.RECPERDK[ ZOBJECT] THEN
                      INVENTX := 1;
                    MOVELEFT( IOCACHE[ GETREC( ZOBJECT,
                                               INVENTX,
                                               SIZEOF( TOBJREC))],
                              OBJECT,
                              SIZEOF( TOBJREC));
                  UNTIL (OBJECT.BOLTACXX <> 0) AND
                        (NOT OBJECT.CURSED);
                  OBJLIST[ X] := INVENTX;
                  WRITE( X : 1);
                  WRITE( ')');
                  WRITE( OBJECT.NAME : 15);
                  WRITE( ' ');
                  PRNTLONG( OBJECT.PRICE);
                  IF NOT OBJECT.CLASSUSE[ CHARACTR[ CHARI].CLASS] THEN
                    WRITE( ' UNUSABLE')
                END
            END;
            
            
          PROCEDURE SCROLNEG;  (* P01020E *)
          
            VAR
                 X : INTEGER;
          
            BEGIN
              INVENTX := OBJLIST[ 1] + 1;
              FOR X := 6 DOWNTO 1 DO
                BEGIN
                  GOTOXY( 0, 12 + X);
                  WRITE( CHR( 29));
                  REPEAT
                    INVENTX := INVENTX - 1;
                    IF INVENTX < 1 THEN
                      INVENTX := SCNTOC.RECPERDK[ ZOBJECT] - 1;
                    MOVELEFT( IOCACHE[ GETREC( ZOBJECT,
                                               INVENTX,
                                               SIZEOF( TOBJREC))],
                              OBJECT,
                              SIZEOF( TOBJREC))
                  UNTIL (OBJECT.BOLTACXX <> 0) AND
                        (NOT OBJECT.CURSED);
                  OBJLIST[ X] := INVENTX;
                  WRITE( X : 1);
                  WRITE( ')');
                  WRITE( OBJECT.NAME : 15);
                  WRITE( ' ');
                  PRNTLONG( OBJECT.PRICE);
                  IF NOT OBJECT.CLASSUSE[ CHARACTR[ CHARI].CLASS] THEN
                    WRITE( ' UNUSABLE')
                END
            END;
          
          
          PROCEDURE PURCHASE;  (* P01020F *)
          
            VAR
                 INSERTX : INTEGER;
          
          
            PROCEDURE AASTRAA( ASTR: STRING);  (* P010210 *)
            
              BEGIN
                CENTSTR( CONCAT( '** ', ASTR, ' **'));
                EXIT( PURCHASE);
              END;
              
              
            BEGIN (* PURCHASE *)
              REPEAT
                NOTPURCH := FALSE;
                GOTOXY( 0, 21);
                WRITELN( CHR( 11));
                WRITE( 'PURCHASE WHICH ITEM ([RETURN] EXITS) ? >');
                GETKEY;
                BUYX := ORD( INCHAR) - ORD( '0');
                IF INCHAR = CHR( CRETURN) THEN
                  EXIT( PURCHASE);
              UNTIL (BUYX > 0) AND (BUYX <= 6);
              
              MOVELEFT( IOCACHE[ GETREC( ZOBJECT,
                                         OBJLIST[ BUYX],
                                         SIZEOF( TOBJREC))],
                        OBJECT,
                        SIZEOF( TOBJREC));
                        
              IF OBJECT.BOLTACXX = 0 THEN
                AASTRAA( 'YOU BOUGHT THE LAST ONE')
              ELSE IF CHARACTR[ CHARI].POSS.POSSCNT = 8 THEN
                AASTRAA( 'YOU CANT CARRY ANYTHING MORE')
              ELSE IF TESTLONG( CHARACTR[ CHARI].GOLD, OBJECT.PRICE) < 0 THEN
                AASTRAA( 'YOU CANNOT AFFORD IT');
                
              IF NOT (OBJECT.CLASSUSE[ CHARACTR[ CHARI].CLASS]) THEN
                BEGIN
                  GOTOXY( 0, 22);
                  WRITE( CHR( 11));
                  WRITE( 'UNUSABLE ITEM - CONFIRM BUY (Y/N) ? >');
                  REPEAT
                    GETKEY
                  UNTIL (INCHAR = 'Y') OR (INCHAR = 'N');
                  IF INCHAR = 'N' THEN
                    AASTRAA( 'WE ALL MAKE MISTAKES')
                END
              ELSE
                INCHAR := ' ';
              SUBLONGS( CHARACTR[ CHARI].GOLD, OBJECT.PRICE);
              INSERTX := CHARACTR[ CHARI].POSS.POSSCNT + 1;
              
              WITH CHARACTR[ CHARI].POSS.POSSESS[ INSERTX] DO
                BEGIN
                  EQUIPED := FALSE;
                  IDENTIF := TRUE;
                  CURSED  := FALSE;
                  EQINDEX := OBJLIST[ BUYX];
                END;
              CHARACTR[ CHARI].POSS.POSSCNT := INSERTX;
              IF OBJECT.BOLTACXX > 0 THEN
                OBJECT.BOLTACXX := OBJECT.BOLTACXX - 1;
              MOVELEFT( OBJECT,
                        IOCACHE[ GETRECW( ZOBJECT,
                                          OBJLIST[ BUYX],
                                          SIZEOF( TOBJREC))],
                        SIZEOF( TOBJREC));
              IF ORD( INCHAR) = ORD( 'Y') THEN
                AASTRAA( 'ITS YOUR MONEY')
              ELSE
                AASTRAA( 'JUST WHAT YOU NEEDED')
            END; (* PURCHASE *)
            
            
          BEGIN (* DOBUY *)
            INVENTX := 1;
            NOTPURCH := TRUE;
            OBJLIST[ 1] := 1;
            OBJLIST[ 6] := 1;
            SCROLDIR := 1;
            GOTOXY( 0, 13);
            WRITE( CHR(11));
            REPEAT
              IF NOTPURCH THEN
                IF SCROLDIR = 1 THEN
                  SCROLPOS
                ELSE
                  SCROLNEG;
              NOTPURCH := TRUE;
              SCROLDIR := 1;
              GOTOXY(  0, 20);
              WRITE( CHR( 11));
              WRITE( 'YOU HAVE ');
              PRNTLONG( CHARACTR[ CHARI].GOLD);
              WRITELN( ' GOLD');
              WRITELN( 'YOU MAY P)URCHASE, SCROLL');
              WRITE( ' ' :8);
              WRITELN( 'F)ORWARD OR B)ACK, GO TO THE');
              WRITE( ' ' :8);
              WRITE( 'S)TART, OR L)EAVE');
              GOTOXY( 41, 0);
              REPEAT
                GETKEY
              UNTIL (INCHAR = 'P') OR (INCHAR = 'F') OR
                    (INCHAR = 'B') OR (INCHAR = 'S') OR
                    (INCHAR = 'L');
              
              CASE INCHAR OF
                'P': PURCHASE;
                'S': OBJLIST[ 6] := 1;
                'B': SCROLDIR := - 1;
              END
            UNTIL INCHAR = 'L'
          END;
          
          
        PROCEDURE SELLIDUN( ACTION: INTEGER);  (* P010211 *)
        
          VAR
               UNUSEDXX : ARRAY[ 1..3] OF INTEGER;
               TRANOBJX : INTEGER;
        
        
          PROCEDURE LISTPOSS;  (* P010212 *)
          
            BEGIN
              GOTOXY( 0, 13);
              WRITE( CHR( 11));
              POSSCNT := CHARACTR[ CHARI].POSS.POSSCNT;
              FOR TRANOBJX := 1 TO POSSCNT DO
                BEGIN
                  OBJLIST[ TRANOBJX] :=
                    CHARACTR[ CHARI].POSS.POSSESS[ TRANOBJX].EQINDEX;
                  MOVELEFT( IOCACHE[ GETREC( ZOBJECT,
                                             OBJLIST[ TRANOBJX],
                                             SIZEOF( TOBJREC))],
                            OBJECT,
                            SIZEOF( TOBJREC));
                  WRITE( TRANOBJX : 1);
                  WRITE( CHR( 41));
                  IF CHARACTR[ CHARI].POSS.POSSESS[ TRANOBJX].IDENTIF THEN
                    WRITE( OBJECT.NAME : 15)
                  ELSE
                    WRITE( OBJECT.NAMEUNK : 15);
                  WRITE( ' ');
                  DIVLONG( OBJECT.PRICE, HALFPRIC);
                  IF ACTION = SELL THEN
                    BEGIN
                      IF NOT (CHARACTR[ CHARI].POSS.POSSESS[ TRANOBJX].IDENTIF)
                      THEN
                        BEGIN
                          OBJECT.PRICE.HIGH := 0;
                          OBJECT.PRICE.MID  := 0;
                          OBJECT.PRICE.LOW  := 1
                        END
                    END;
                  PRNTLONG(  OBJECT.PRICE);
                  WRITELN
                END
            END;
            
            
          PROCEDURE TRANSACT;  (* P010213 *)
          
            VAR
                 POSSX : INTEGER;
          
          
            PROCEDURE AASTRAA( ASTR: STRING);  (* P010214 *)
            
              BEGIN
                CENTSTR( ASTR);
                EXIT( TRANSACT)
              END;
              
              
            BEGIN (* TRANSACT *)
              MOVELEFT( IOCACHE[ GETREC( ZOBJECT,
                                         OBJLIST[ TRANOBJX],
                                         SIZEOF( TOBJREC))],
                        OBJECT,
                        SIZEOF( TOBJREC));
              DIVLONG( OBJECT.PRICE, HALFPRIC);
              IF ACTION = SELL THEN
                BEGIN
                  IF NOT CHARACTR[ CHARI].POSS.POSSESS[ TRANOBJX].IDENTIF THEN
                    BEGIN
                      OBJECT.PRICE.HIGH := 0;
                      OBJECT.PRICE.MID  := 0;
                      OBJECT.PRICE.LOW  := 1
                    END;
                  IF CHARACTR[ CHARI].POSS.POSSESS[ TRANOBJX].CURSED THEN
                    AASTRAA( '** WE DONT BUY CURSED ITEMS **')
                END
              ELSE
                BEGIN
                  IF NOT (CHARACTR[ CHARI].POSS.POSSESS[ TRANOBJX].CURSED) AND
                     (ACTION = UNCURSE) THEN
                    AASTRAA( '** THAT IS NOT A CURSED ITEM **');
                    
                  IF CHARACTR[ CHARI].POSS.POSSESS[ TRANOBJX].IDENTIF AND
                      (ACTION = IDENTIFY) THEN
                    AASTRAA( '** THAT HAS BEEN IDENTIFIED **');
                    
                  IF TESTLONG( CHARACTR[ CHARI].GOLD, OBJECT.PRICE) < 0 THEN
                    AASTRAA( '** YOU CANT AFFORD THE FEE **');
                END;
              
              IF ACTION = SELL THEN
                ADDLONGS( CHARACTR[ CHARI].GOLD, OBJECT.PRICE)
              ELSE
                SUBLONGS( CHARACTR[ CHARI].GOLD, OBJECT.PRICE);
                
              IF ACTION = IDENTIFY THEN
                CHARACTR[ CHARI].POSS.POSSESS[ TRANOBJX].IDENTIF := TRUE
              ELSE
                BEGIN
                  IF TRANOBJX < CHARACTR[ CHARI].POSS.POSSCNT THEN
                    FOR POSSX := (TRANOBJX + 1) TO
                                   CHARACTR[ CHARI].POSS.POSSCNT DO
                      CHARACTR[ CHARI].POSS.POSSESS[ POSSX - 1] :=
                        CHARACTR[ CHARI].POSS.POSSESS[ POSSX];
                        
                  CHARACTR[ CHARI].POSS.POSSCNT :=
                                             CHARACTR[ CHARI].POSS.POSSCNT - 1;
                  MOVELEFT( IOCACHE[ GETREC( ZOBJECT,
                                             OBJLIST[ TRANOBJX],
                                             SIZEOF( TOBJREC))],
                            OBJECT,
                            SIZEOF( TOBJREC));
                  IF ACTION = SELL THEN
                    IF OBJECT.BOLTACXX > - 1 THEN
                      OBJECT.BOLTACXX := OBJECT.BOLTACXX + 1;
                    
                  MOVELEFT( OBJECT,
                            IOCACHE[ GETRECW( ZOBJECT,
                                              OBJLIST[ TRANOBJX],
                                              SIZEOF( TOBJREC))],
                            SIZEOF( TOBJREC));
                END;
                
              CENTSTR( '** ANYTHING ELSE, SIRE? **');
              LISTPOSS
            END; (* TRANSACT *)
            
            
          BEGIN (* SELLIDUN *)
            LISTPOSS;
            REPEAT
              IF POSSCNT = 0 THEN
                EXIT( SELLIDUN);
              GOTOXY(  0, 22);
              IF ACTION = SELL THEN
                BEGIN
                  WRITE( CHR( 11));
                  WRITE( 'WHICH DO YOU WISH TO SELL ? >')
                END
              ELSE IF ACTION = UNCURSE THEN
                BEGIN
                  WRITE( CHR( 11));
                  WRITE( 'WHICH DO YOU WISH UNCURSED ? >')
                END
              ELSE
                BEGIN
                  WRITE( CHR( 11));
                  WRITE( 'WHICH DO YOU WISH IDENTIFIED ? >')
                END;
              GETKEY;
              IF ORD( INCHAR) = CRETURN THEN
                EXIT( SELLIDUN);
              TRANOBJX := ORD( INCHAR) - ORD( '0');
              IF (TRANOBJX > 0) AND (TRANOBJX <= POSSCNT) THEN
                TRANSACT
            UNTIL FALSE
          END;
          
          
        BEGIN (* DOPLAYER *)
          REPEAT
            GOTOXY( 0, 13);
            WRITE( CHR( 11));
            WRITE( '      WELCOME ');
            WRITE(  CHARACTR[ CHARI].NAME);
            WRITELN;
            WRITE( '     YOU HAVE ');
            PRNTLONG( CHARACTR[ CHARI].GOLD);
            WRITELN( ' GOLD');
            WRITELN;
            WRITELN( 'YOU MAY B)UY  AN ITEM,');
            WRITELN( '        S)ELL AN ITEM, HAVE AN ITEM');
            WRITELN( '        U)NCURSED,  OR HAVE AN ITEM');
            WRITELN( '        I)DENTIFIED, OR L)EAVE');
            GOTOXY( 41, 0);
            GETKEY;
                           
            CASE INCHAR OF
              'U': SELLIDUN( UNCURSE);
              'I': SELLIDUN( IDENTIFY);
              'S': SELLIDUN( SELL);
              'B': DOBUY;
              'L': EXIT( DOPLAYER);
            END
          UNTIL FALSE
        END; (* DOPLAYER *)
        
        
      BEGIN (* BOLTAC *)
        HALFPRIC := 2;
        XGOTO := XCASTLE;
        REPEAT
          GOTOXY( 0, 13);
          WRITE( CHR( 11));
          WRITE( '       WELCOME TO THE TRADING POST');
          WRITELN;
          CHARI := GETCHARX( FALSE, 'WHO WILL ENTER');
          IF CHARI = -1 THEN
            EXIT( SHOPS);
          
          IF (CHARI < PARTYCNT) THEN
            DOPLAYER
        UNTIL FALSE
      END;
      
      

(* ========================================================================== *)
(* DISK: Wiz1A.DSK | FILE: SHOPS2.TEXT                                 *)
(* ========================================================================== *)


    PROCEDURE CEMETARY;  (* P010215 *)
    
      VAR
           TWO : INTEGER;
           
           
      PROCEDURE TOMBSTON( CHARI: INTEGER);  (* P010216 *)
      
        VAR
            TOMBY : INTEGER;
            TOMBX : INTEGER;
        
        
        PROCEDURE DSPTOMBL( TOMBCHRS: STRING);  (* P010217 *)
          
          BEGIN
            MVCURSOR( TOMBX, TOMBY);
            PRINTSTR( TOMBCHRS);
            TOMBY := TOMBY + 1
          END;
          
          
        BEGIN  (* TOMBSTON *)
          TOMBX := 20 * (CHARI MOD 2);
          TOMBY :=  6 * (CHARI DIV 2);
          UNITREAD( DRIVE1, CHARSET, BLOCKSZ, SCNTOCBL + 2, 0);
          MVCURSOR( TOMBX, TOMBY);
          
          DSPTOMBL( '+,-.');  (*  CHR(43)  CHR(44)  CHR(45)  CHR(46)  *)
          DSPTOMBL( '/012');  (*  CHR(47)  CHR(48)  CHR(49)  CHR(50)  *)  
          DSPTOMBL( '3456');  (*  CHR(51)  CHR(52)  CHR(53)  CHR(54)  *)
          DSPTOMBL( '789:');  (*  CHR(55)  CHR(56)  CHR(57)  CHR(58)  *)
          DSPTOMBL( ';<=>');  (*  CHR(59)  CHR(60)  CHR(61)  CHR(62)  *)
          DSPTOMBL( '?XYZ');  (*  CHR(63)  CHR(88)  CHR(89)  CHR(90)  *)
                              (* NOTE LAST LINE JUMPS TO XYZ *)
                              
          UNITREAD( DRIVE1, CHARSET, BLOCKSZ, SCNTOCBL + 1, 0);
          MVCURSOR( TOMBX + 1, TOMBY - 2);
          PRINTNUM( CHARACTR[ CHARI].AGE DIV 52, 2);
          MVCURSOR( TOMBX + 4, TOMBY - 4);
          PRINTSTR( CHARACTR[ CHARI].NAME)
        END;  (* TOMBSTON *)
        
        
      PROCEDURE BADSTUFF;  (* P010218 *)
      
      
        PROCEDURE BREAKPOS;  (* P010219 *)
        
          VAR
               X     : INTEGER;
               POSSX : INTEGER;
        
          BEGIN
            WITH CHARACTR[ LLBASE04] DO
              BEGIN
                FOR POSSX := 1 TO POSS.POSSCNT DO
                  IF NOT POSS.POSSESS[ POSSX].CURSED THEN
                    IF (RANDOM MOD 21 > ATTRIB[ LUCK]) THEN
                      POSS.POSSESS[ POSSX].EQINDEX := 0;
                X := 0;
                FOR POSSX := 1 TO POSS.POSSCNT DO
                  IF POSS.POSSESS[ POSSX].EQINDEX <> 0 THEN
                    BEGIN
                      X := X + 1;
                      POSS.POSSESS[ X] := POSS.POSSESS[ POSSX]
                    END;
                POSS.POSSCNT := X
            END
          END;
          
          
        BEGIN (* BADSTUFF *)
          TWO := 2;
          FOR LLBASE04 := 0 TO PARTYCNT - 1 DO
            BEGIN
              IF CHARACTR[ LLBASE04].STATUS <> LOST THEN
                BEGIN
                  WITH CHARACTR[ LLBASE04] DO
                    BEGIN
                      IF STATUS < DEAD THEN
                        STATUS := DEAD;
                      INMAZE := FALSE;
                      DIVLONG( GOLD, TWO);
                      BREAKPOS;
                      IF (RANDOM MOD 50) < MAZELEV THEN
                        BEGIN
                          LOSTXYL.LOCATION[ 1] := -1;
                          LOSTXYL.LOCATION[ 2] := -1;
                          LOSTXYL.LOCATION[ 3] := -1
                        END
                      ELSE
                        BEGIN
                          LOSTXYL.LOCATION[ 1] := MAZEX;
                          LOSTXYL.LOCATION[ 2] := MAZEY;
                          LOSTXYL.LOCATION[ 3] := MAZELEV
                        END;
                      MOVELEFT( CHARACTR[ LLBASE04],
                                IOCACHE[ GETRECW( ZCHAR,
                                                  CHARDISK[ LLBASE04],
                                                  SIZEOF( TCHAR))],
                                SIZEOF( TCHAR))
                    END
                END
            END;  (* END FOR *)
            
          MOVELEFT( IOCACHE[ GETREC(  ZZERO, 0, SIZEOF( TSCNTOC))],
                    SCNTOC,
                    SIZEOF( TSCNTOC))
        END;
        
        
      BEGIN (* CEMETARY *)
        BADSTUFF;
        CLRRECT( 0, 0, 40, 24);
        GRAPHICS;
        FOR LLBASE04 := 0 TO PARTYCNT - 1 DO
          TOMBSTON( LLBASE04);
        UNITREAD( DRIVE1, CHARSET, BLOCKSZ, SCNTOCBL + 2, 0);
        MVCURSOR( 0, 19);
        PRINTCHR( CHR(33));         (* UPPER LEFT CORNER  *)
        FOR LLBASE04 := 1 TO 38 DO
          PRINTCHR( CHR(34));       (* HORIZONTAL LINE    *)
        PRINTCHR( CHR(35));         (* UPPER RIGHT CORNER *)
        MVCURSOR( 0, 20);
        PRINTCHR( CHR(36));         (* VERTICAL BAR       *)
        MVCURSOR( 39, 20);
        PRINTCHR( CHR(36));
        MVCURSOR( 0, 21);
        PRINTCHR( CHR(39));
        FOR LLBASE04 := 1 TO 38 DO
          PRINTCHR( CHR(34));
        PRINTCHR( CHR(40));
        MVCURSOR( 0, 22);
        PRINTCHR( CHR(36));
        MVCURSOR( 39, 22);
        PRINTCHR( CHR(36));
        MVCURSOR( 0, 23);
        PRINTCHR( CHR(37));
        FOR LLBASE04 := 1 TO 38 DO
          PRINTCHR( CHR(34));
        PRINTCHR( CHR(38));
        UNITREAD( DRIVE1, CHARSET, BLOCKSZ, SCNTOCBL + 1, 0);
        MVCURSOR( 1, 20);
        PRINTSTR( 'YOUR ENTIRE PARTY HAS BEEN SLAUGHTERED');
        MVCURSOR( 1, 22);
        PRINTSTR( '  PRESS RETURN TO LEAVE THE CEMETERY  ');
        PARTYCNT := 0;
        REPEAT
          GETKEY
        UNTIL INCHAR = CHR( CRETURN);
        WRITE( CHR( 12));
        GOTOXY( 41, 0);
        LLBASE04 := -2;
        XGOTO := XSCNMSG;
        EXIT( SHOPS)
      END;
  
  
    PROCEDURE EDGETOWN;  (* P01021A *)
    
    
      PROCEDURE ENTMAZE;  (* P01021B *)
      
        VAR
             X : INTEGER;
      
        BEGIN
          GOTOXY( 0, 13);
          WRITELN( CHR(11));
          WRITELN( 'ENTERING' :24);
          WRITELN( SCNTOC.GAMENAME : 20 + LENGTH( SCNTOC.GAMENAME) DIV 2);
          GOTOXY( 41, 0);
          XGOTO := XNEWMAZE;
          MAZEX    :=  0;
          MAZEY    :=  0;
          MAZELEV  := -1;
          DIRECTIO :=  0;
          EXIT( SHOPS)
        END;
        
        
      PROCEDURE UPDCHARS;  (* P01021C *)
      
        VAR
             X : INTEGER;
      
        BEGIN
          FOR X := 0 TO PARTYCNT - 1 DO
            BEGIN
              CHARACTR[ X].INMAZE := FALSE;
              MOVELEFT( CHARACTR[ X],
                        IOCACHE[ GETRECW( ZCHAR,
                                          CHARDISK[ X],
                                          SIZEOF( TCHAR))],
                        SIZEOF( TCHAR));
            END;
          PARTYCNT := 0;
          MOVELEFT( IOCACHE[ GETREC( ZZERO, 0, SIZEOF( TSCNTOC))],
                    X,
                    2);
          EXIT( SHOPS)
        END;  (* UPDCHARS *)
        
        
      BEGIN (* EDGETOWN *)
        GOTOXY( 0, 13);
        IF PARTYCNT = 0 THEN
          BEGIN
            WRITE( CHR( 11));
            WRITELN( 'YOU MAY GO TO THE T)RAINING GROUNDS,');
            WRITELN( 'RETURN TO THE C)ASTLE, OR L)EAVE THE');
            WRITELN( 'GAME.') 
          END
        ELSE
          BEGIN
            WRITE( CHR( 11));
            WRITELN( 'YOU MAY ENTER THE M)AZE, THE T)RAINING');
            WRITELN( 'GROUNDS, C)ASTLE,  OR L)EAVE THE GAME.')
          END;
        REPEAT
          GOTOXY( 41, 0);
          GETKEY
        UNTIL (INCHAR = 'T') OR (INCHAR = 'C') OR (INCHAR = 'L') OR
              ((INCHAR = 'M') AND (PARTYCNT > 0));
          
        IF INCHAR = 'M' THEN
          ENTMAZE
        ELSE IF INCHAR = 'T' THEN
          BEGIN
            XGOTO := XTRAININ;
            UPDCHARS
          END
        ELSE IF INCHAR = 'L' THEN
          BEGIN
            XGOTO := XDONE;
            UPDCHARS
          END
        ELSE
          BEGIN
            XGOTO := XCASTLE;
            EXIT( SHOPS)
          END
      END;
  
  
    PROCEDURE CHK4WIN;  (* P01021D *)
    
      VAR
          POSSI    : INTEGER;   (* MULTIPLE USES *)
          CHARX    : INTEGER;
          THISCHAR : TCHAR;
          WONGAME  : BOOLEAN;
          
          
      PROCEDURE CONGRATS;  (* P01021E *)
    
        VAR
             EXPBONUS : TWIZLONG;
             AWARDOVR : PACKED ARRAY[ 0..15] OF BOOLEAN;
      
        BEGIN
          EXPBONUS.HIGH := 0;
          EXPBONUS.LOW  := 0;
          EXPBONUS.MID  := 25;
          FOR CHARX := 0 TO PARTYCNT - 1 DO
            BEGIN
              CHARACTR[ CHARX].POSS.POSSCNT := 0;
              CHARACTR[ CHARX].GOLD.HIGH := 0;
              CHARACTR[ CHARX].GOLD.MID  := 0;
              ADDLONGS( CHARACTR[ CHARX].EXP, EXPBONUS);
              MOVELEFT( CHARACTR[ CHARX].LOSTXYL.AWARDS[ 4], AWARDOVR, 2);
              AWARDOVR[ 0] := TRUE;
              MOVELEFT( AWARDOVR, CHARACTR[ CHARX].LOSTXYL.AWARDS[ 4], 2)
            END;
          WRITE( CHR( 12));
          WRITELN( '*** CONGRATULATIONS ***' : 32);
          TEXTMODE;
          WRITELN;
          WRITELN( 'YOU HAVE COMPLETED YOUR QUEST AND THE');
          WRITELN( 'AMULET IS NOW BACK IN THE HANDS OF');
          WRITELN( 'YOUR BENIFICENT RULER, TREBOR.');
          WRITELN;
          WRITELN( 'IN RETURN FOR THIS, HE GRANTS YOU A');
          WRITELN( 'BOON OF 250,000 EXPERIENCE POINTS');
          WRITELN( 'EACH!');
          WRITELN;
          WRITELN( 'ADDITIONALLY, YOU WILL BE INITIATED');
          WRITELN( 'INTO THE OVERLORD''S HONOR GUARD AND');
          WRITELN( 'THUS WILL BE ENTITLED TO WEAR THE');
          WRITELN( 'CHEVRON (>) OF THIS RANK EVERMORE.');
          WRITELN;
          WRITELN( 'HOWEVER, YOU MUST GIVE UP ALL YOUR');
          WRITELN( 'EQUIPMENT AND MOST OF YOUR MONEY TO');
          WRITELN( 'PAY FOR YOUR INITIATION.');
          WRITELN;
          WRITELN( 'PRESS [RETURN], HONORED ONES');
          GOTOXY( 41, 0);
          READLN( INPUT);
          WRITE( CHR( 12))
        END;
        
        
      BEGIN (* CHK4WIN *)
        WONGAME := FALSE;
        FOR CHARX := 0 TO PARTYCNT -1 DO
          BEGIN
            FOR POSSI := 1 TO CHARACTR[ CHARX].POSS.POSSCNT DO
              IF CHARACTR[ CHARX].POSS.POSSESS[ POSSI].EQINDEX = 94 THEN
                WONGAME := TRUE;
            CHARACTR[ CHARX].LOSTXYL.LOCATION[ 1] := 0;
            CHARACTR[ CHARX].LOSTXYL.LOCATION[ 2] := 0;
            CHARACTR[ CHARX].LOSTXYL.LOCATION[ 3] := 0
          END;
        IF WONGAME THEN
          CONGRATS;
        FOR CHARX := 0 TO PARTYCNT - 1 DO
          BEGIN
            CHARACTR[ CHARX].INMAZE :=
              CHARACTR[ CHARX].STATUS = OK;
            MOVELEFT( CHARACTR[ CHARX],
                      IOCACHE[ GETRECW( ZCHAR,
                                        CHARDISK[ CHARX],
                                        SIZEOF( TCHAR))],
                      SIZEOF( TCHAR))
          END;
          
        MOVELEFT( IOCACHE[ GETREC( ZZERO, 0, SIZEOF( TSCNTOC))],
                  CHARX,
                  2);
        CHARX := 0;
        POSSI := 0;
        WHILE CHARX < PARTYCNT DO
          BEGIN
            CHARACTR[ POSSI] := CHARACTR[ CHARX];
            CHARDISK[ POSSI] := CHARDISK[ CHARX];
            IF CHARACTR[ POSSI].STATUS = OK THEN
              POSSI := POSSI + 1;
            CHARX := CHARX + 1
          END;
        PARTYCNT := POSSI;
        XGOTO := XCASTLE;
        EXIT( SHOPS)
    END;  (* CHK4WIN *)
  
  
    BEGIN (* SHOPS *)
    
      CASE XGOTO OF
        XCEMETRY:  CEMETARY;
           XCANT:  CANT;
         XBOLTAC:  BOLTAC;
        XCHK4WIN:  CHK4WIN;
        XEDGTOWN:  EDGETOWN;
      END;
      
    END;  (* SHOPS *)
  

(* ========================================================================== *)
(* DISK: Wiz1B.DSK | FILE: SPECIALS.TEXT                               *)
(* ========================================================================== *)

    
SEGMENT PROCEDURE SPECIALS;   (* P010301 *)
    
    CONST
          SERIALBL = 5;
  
    VAR
         SPCINDEX : INTEGER;
         UNUSED   : INTEGER;
         NUM2000  : RECORD CASE INTEGER OF
                      1: (I: INTEGER);
                      2: (P: ^INTEGER);
                    END;
  
  
    PROCEDURE INSPECT;  (* P010302 *)
    
      VAR
           PICKCNT  : INTEGER;
           PICKLIST : ARRAY[ 1..6] OF INTEGER;
           UNUSEDXX : INTEGER;
           PICKCHAR : INTEGER;
           PICKREC  : TCHAR;
           MAZE     : TMAZE;
           INMYROOM : PACKED ARRAY[ 0..19] OF PACKED ARRAY[ 0..19] OF BOOLEAN;
           CHECKED  : PACKED ARRAY[ 0..19] OF PACKED ARRAY[ 0..19] OF BOOLEAN;
           
        
        
      PROCEDURE LOOKLOST;  (* P010303 *)
      
      
        PROCEDURE FOUNDLOS;  (* P010304 *)
        
          BEGIN
            IF PICKCNT = 5 THEN
              EXIT( LOOKLOST);
            PICKCNT := PICKCNT + 1;
            PICKLIST[ PICKCNT] := PICKCHAR;
            WRITE( PICKCNT : 1);
            WRITE( ') ');
            WRITE( PICKREC.NAME);
            WRITELN
          END;  (* FOUNDLOS *)
          
          
        BEGIN  (* LOOKLOST *)
          PICKCNT := 0;
          WRITE( CHR( 12));
          WRITELN( 'FOUND:');
          WRITELN;
          WRITELN;
          WRITELN;
          FOR PICKCHAR := 0 TO SCNTOC.RECPERDK[ ZCHAR] - 1 DO
            BEGIN
              MOVELEFT( IOCACHE[ GETREC( ZCHAR, PICKCHAR, SIZEOF( TCHAR))],
                        PICKREC,
                        SIZEOF( TCHAR));
              IF NOT PICKREC.INMAZE THEN
                IF PICKREC.LOSTXYL.LOCATION[ 3] = MAZELEV THEN
                  IF INMYROOM[ PICKREC.LOSTXYL.LOCATION[ 1],
                               PICKREC.LOSTXYL.LOCATION[ 2] ] THEN
                    FOUNDLOS
            END;
          IF PICKCNT = 0 THEN
            WRITELN( '** NO ONE **')
        END;  (* LOOKLOST *)
        
        
      PROCEDURE PICKUP;  (* P010305 *)
      
        BEGIN
          IF PARTYCNT = 6 THEN
            BEGIN
              GOTOXY( 0, 20);
              WRITE( CHR( 11));
              WRITELN( 'YOU HAVE 6 - PRESS [RET]');
              GOTOXY( 41, 0);
              REPEAT
                GETKEY
              UNTIL INCHAR = CHR( CRETURN);
              EXIT( PICKUP)
            END;
              
          REPEAT
            GOTOXY( 0, 20);
            WRITE( CHR( 11));
            WRITE( 'GET WHO (0=EXIT) >');
            GETKEY;
            PICKCHAR := ORD( INCHAR) - ORD( '0');
            IF PICKCHAR = 0 THEN
              EXIT( PICKUP)
          UNTIL (PICKCHAR > 0) AND (PICKCHAR <= PICKCNT);
          
          IF PICKLIST[ PICKCHAR] = -1 THEN
            EXIT( PICKUP);
          MOVELEFT( IOCACHE[ GETREC( ZCHAR,
                                     PICKLIST[ PICKCHAR],
                                     SIZEOF( TCHAR))],
                    CHARACTR[ PARTYCNT],
                    SIZEOF( TCHAR));
          CHARDISK[ PARTYCNT] := PICKLIST[ PICKCHAR];
          CHARACTR[ PARTYCNT].LOSTXYL.LOCATION[ 1] := 0;
          CHARACTR[ PARTYCNT].LOSTXYL.LOCATION[ 2] := 0;
          CHARACTR[ PARTYCNT].LOSTXYL.LOCATION[ 3] := 0;
          CHARACTR[ PARTYCNT].INMAZE := TRUE;
          MOVELEFT( CHARACTR[ PARTYCNT],
                    IOCACHE[ GETRECW( ZCHAR,
                                      PICKLIST[ PICKCHAR],
                                      SIZEOF( TCHAR))],
                    SIZEOF( TCHAR));
          PICKLIST[ PICKCHAR] := - 1;
          PARTYCNT := PARTYCNT + 1;
          GOTOXY( 0, 3 + PICKCHAR);
          WRITE( CHR( 29))
        END;  (* PICKUP *)
        
        
      PROCEDURE EXPLROOM;  (* P010306 *)
      
        VAR
             VERT     : INTEGER;
             HORZ     : INTEGER;
             DONELOOK : BOOLEAN;
      
      
        PROCEDURE CHECKLOC( X:    INTEGER;    (* P010307 *)
                            Y:    INTEGER;
                            WALL: TWALL);
        
          BEGIN
            IF WALL <> OPEN THEN
              EXIT( CHECKLOC);
            X := (X + 20) MOD 20;
            Y := (Y + 20) MOD 20;
            IF INMYROOM[ X][ Y] THEN
              EXIT( CHECKLOC);
            DONELOOK := FALSE;
            INMYROOM[ X][ Y] := TRUE
          END;  (* CHECKLOC *)
          
          
        BEGIN (* EXPLROOM *)
          MOVELEFT( IOCACHE[ GETREC( ZMAZE, MAZELEV - 1, SIZEOF( TMAZE))],
                    MAZE,
                    SIZEOF( TMAZE));
          FILLCHAR( INMYROOM, 80, 0);
          INMYROOM[ MAZEX][ MAZEY] := TRUE;
          FILLCHAR( CHECKED, 80, 0);
          REPEAT
            WRITE( '.');
            DONELOOK := TRUE;
            FOR HORZ := 0 TO 19 DO
              FOR VERT := 0 TO 19 DO
                IF INMYROOM[ HORZ][ VERT] THEN
                  IF NOT CHECKED[ HORZ][ VERT] THEN
                    BEGIN
                      CHECKLOC( HORZ + 1, VERT, MAZE.E[ HORZ][ VERT]);
                      CHECKLOC( HORZ - 1, VERT, MAZE.W[ HORZ][ VERT]);
                      CHECKLOC( HORZ, VERT - 1, MAZE.S[ HORZ][ VERT]);
                      CHECKLOC( HORZ, VERT + 1, MAZE.N[ HORZ][ VERT]);
                      CHECKED[ HORZ][ VERT] := TRUE
                    END
          UNTIL DONELOOK
        END;  (* EXPLROOM *)
        
        
      BEGIN (* INSPECT *)
        WRITE( CHR( 12));
        WRITE( 'LOOKING');
        TEXTMODE;
        EXPLROOM;
        LOOKLOST;
        REPEAT
          GOTOXY( 0, 20);
          WRITE( 'OPTIONS: ');
          IF PICKCNT > 0 THEN
            WRITE( 'P)ICK UP, ');
          WRITE( 'L)EAVE');
          REPEAT
            GOTOXY( 41, 0);
            GETKEY
          UNTIL (INCHAR = 'P') OR (INCHAR = 'L');
          IF INCHAR = 'P' THEN
            IF PICKCNT > 0 THEN
              PICKUP;
        UNTIL INCHAR = 'L';
        XGOTO := XRUNNER;
        GRAPHICS;
        EXIT( SPECIALS)
      END;  (* INSPECT *)
      
      
    FUNCTION FINDFILE( DRIVE:  INTEGER;  (* P010308 *)
                       FILENM: STRING) : INTEGER;
                       
      TYPE
           DIRENTRY = RECORD
             FIRSTBLK : INTEGER;
             LASTBLK  : INTEGER;
             FILEKIND : PACKED RECORD
                 FT : (VOLHEAD, BADBLK, MACH6502, TEXT, DEBUG,
                       DATA, GRAFFILE, FOTOFILE, SUBDIR);
               END;
             FILENAME : STRING[ 7];
             VOLLB    : INTEGER;
             FILECNT  : INTEGER;
             LOADTIM  : INTEGER;
             BOOTDATE : INTEGER;
             RES1     : INTEGER;
             RES2     : INTEGER;
         END;
               
      VAR
           DIR   : ARRAY[ 0..3] OF DIRENTRY;
           FILEI : INTEGER;
           FILEX : INTEGER;
                       
      BEGIN
        NUM2000.I := 8192;
        UNITREAD( DRIVE, DIR, 104, 2, 0);
        IF IORESULT <> 0 THEN
          FINDFILE := - ABS( IORESULT)
        ELSE
          BEGIN
            FILEI := 0;
            FOR FILEX := 1 TO DIR[ 0].FILECNT DO
              IF (DIR[ FILEX].FILEKIND.FT >= BADBLK) AND
                 (DIR[ FILEX].FILEKIND.FT <= FOTOFILE) THEN
                IF DIR[ FILEX].FILENAME = FILENM THEN
                  FILEI := FILEX;
            IF FILEI = 0 THEN
              FINDFILE := - 9
            ELSE
              FINDFILE := DIR[ FILEI].FIRSTBLK
          END
      END;  (* FINDFILE *)
      
      
      
    PROCEDURE INITGAME;  (* P010309 *)
    
      VAR
           CPTEMP   : INTEGER;                 (* COPY PROTECTION CODE USES *)
           UNUSED   : INTEGER;                 (* CP CODE *)
           SAVEI    : INTEGER;                 (* CP CODE *)
           SYNCH    : ARRAY[ 0..3] OF INTEGER; (* CP CODE *)
           
           DUPLSER : STRING[ 7];
           MASTSER : STRING[ 7];
    
    
    PROCEDURE MAZESCRN;  (* P01030A *)
      
      
        PROCEDURE HORZHYPH;  (* P01030B *)
        
          BEGIN
            FOR LLBASE04 := 1 TO 38 DO
              PRINTCHR( CHR( 34))        (* HYPHEN GRAPHIC *)
          END;
          
          
        PROCEDURE HORZLINE( LINE : INTEGER);  (* P01030C *)
        
          BEGIN
            MVCURSOR( 0, LINE);
            PRINTCHR( CHR( 39));         (* TILTED "T" ON LEFT OF LINE  *)
            HORZHYPH;
            PRINTCHR( CHR( 40))          (* TILTED "T" ON RIGHT OF LINE *)
          END;
          
          
        PROCEDURE SCRNOUTL;  (* P01030D *)
        
          BEGIN
            MVCURSOR( 0, 0);
            PRINTCHR( CHR( 33));         (* UPPER LEFT CORNER *)
            FOR LLBASE04 := 1 TO 38 DO
              PRINTCHR( CHR( 34));       (* HYPHEN *)
            PRINTCHR( CHR( 35));         (* UPPER RIGHT CORNER *)
            FOR LLBASE04 := 1 TO 22 DO
              BEGIN
                MVCURSOR( 0, LLBASE04);
                PRINTCHR( CHR( 36));     (* VERTICAL BAR ON LEFT  *)
                MVCURSOR( 39, LLBASE04);
                PRINTCHR( CHR( 36))      (* VERTICAL BAR ON RIGHT *)
              END;
            MVCURSOR( 0, 23);
            PRINTCHR( CHR( 37));         (* BOTTOM LEFT CORNER *)
            FOR LLBASE04 := 1 TO 38 DO
              PRINTCHR( CHR( 34));       (* HYPHEN *)
            PRINTCHR( CHR( 38))          (* BOTTOM RIGHT CORNER *)
          END;
          
          
        PROCEDURE INITSCRN;  (* P01030E *)
        
          VAR
               UNUSED : ARRAY[ 0..1] OF INTEGER;
              
          BEGIN
            CLRRECT( 0, 0, 40, 24);
            UNITREAD( DRIVE1, CHARSET, BLOCKSZ, SCNTOCBL + 2, 0);
            SCRNOUTL;
            HORZLINE( 10);
            HORZLINE( 15);
            MVCURSOR( 12, 0);           
            PRINTCHR( CHR( 91));         (* TILTED "T" TOP OF LINE *)
            FOR LLBASE04 := 1 TO 9 DO
              BEGIN
                MVCURSOR( 12, LLBASE04);
                PRINTCHR( CHR( 92))      (* VERTICAL BAR *)
              END;
            MVCURSOR( 12, 5);
            PRINTCHR( CHR( 93));         (* TILTED "T" LEFT OF LINE *)
            FOR LLBASE04 := 13 TO 38 DO
              PRINTCHR( CHR( 34));       (* HYPHEN *)
            PRINTCHR( CHR( 40));         (* TILTED "T" RIGHT OF LINE *)
            MVCURSOR( 12, 10);
            PRINTCHR( CHR( 94));         (* TILTED "T" BOTTOM OF LINE *)
            UNITREAD( DRIVE1, CHARSET, BLOCKSZ, SCNTOCBL + 1, 0);
            MVCURSOR( 1, 16);
            PRINTSTR( '# CHARACTER NAME  CLASS AC HITS STATUS')
          END;
          
        BEGIN (* MAZESCRN *)
          CLRRECT( 0, 0, 40, 24);  (* REPEATED IN INITSCRN!? *)
          INITSCRN
        END;
        
        
      PROCEDURE GTSERIAL;  (* P01030F *)
      
        (* GOOFY TRACK SYNCH COPYPROTECTION CODE *)
      
        BEGIN
          UNITREAD( DRIVE1, IOCACHE, BLOCKSZ, SERIALBL, 0);
          CPTEMP := 31;  (* OFFSET TO MANGLED SYNCH COUNTS *)
          FOR SAVEI := 10 TO 13 DO
            BEGIN
              MOVELEFT( IOCACHE[ CPTEMP], SYNCH[ (SAVEI - 10)], 2);
              CPTEMP := CPTEMP + 2 * (SYNCH[ SAVEI - 10] MOD 13) + 5
            END;
          MOVELEFT( IOCACHE, MASTSER, 8)
        END;
        
        
      PROCEDURE COPYPROT;  (* P010310 *)
      
        VAR
             CPCALC   : INTEGER;
             TRIES    : INTEGER;
             GOODCOPY : BOOLEAN;
      
        BEGIN
          FOR TRIES := 1 TO 5 DO
            BEGIN
               GOODCOPY := TRUE;
              FOR SAVEI := 10 TO 13 DO
                BEGIN
                  UNITREAD( DRIVE1, IOCACHE, BLOCKSZ, 8 * SAVEI, 0);
                  MVCURSOR( 60, 0);  (* JUMP TO $2002 AND EXECUTE *)
                  CPTEMP := NUM2000.P^;  (* SYNCH COUNT FROM $2002
                                              READING DISK TRACKS *)
                  IF SAVEI = 10 THEN
                    CPCALC := CPTEMP - SYNCH[ 10 - 10];
                  CPTEMP := CPTEMP - CPCALC;
                  IF ABS( CPTEMP -  SYNCH[ SAVEI - 10]) > 29 THEN
                     GOODCOPY := FALSE;
                END;
              IF GOODCOPY THEN
                EXIT( COPYPROT);
            END;
            
          MVCURSOR( 70, 0);  (* CRASH AND BURN *)
          HALT
        END;
        
        
        
      BEGIN (* INITGAME *)
      
        IF LLBASE04 = -1 THEN
          BEGIN
            REPEAT
              WRITE( CHR( 12));
              GOTOXY( 0, 11);
              WRITE( ' SCENARIO MASTER IN DRV 1, PRESS [RET]');
              REPEAT
                GOTOXY( 41, 0);
                GETKEY
              UNTIL INCHAR = CHR( CRETURN);
              SCNTOCBL := FINDFILE( DRIVE1, 'SCENARIO.DATA')
            UNTIL SCNTOCBL >= 0;
            
            UNITREAD( DRIVE1, NUM2000.P^, BLOCKSZ, SCNTOCBL + 3, 0);
                (* SCNTOCBL + 3 FOLLOWS MAGE AND PRIEST SPELL NAMES *)
                (* COPY PROTECTION CODE GETS LOADED TO $2000        *)
            GTSERIAL; (* AND SOME COPY PROTECTION *)
            COPYPROT; (* MORE COPY PROTECTION     *)
            
            REPEAT
              WRITE( CHR( 12));
              GOTOXY( 0, 11);
              WRITE( ' MASTER/DUPLICATE IN DRV 1, PRESS [RET]');
              REPEAT
                GOTOXY( 41, 0);
                GETKEY
              UNTIL INCHAR = CHR( CRETURN);
              SCNTOCBL := FINDFILE( DRIVE1, 'SCENARIO.DATA');
              UNITREAD( DRIVE1, IOCACHE, BLOCKSZ, SERIALBL, 0);
              MOVELEFT( IOCACHE, DUPLSER, 8)
            UNTIL (SCNTOCBL >= 0) AND (MASTSER = DUPLSER);
            
            TIMEDLAY := 2000;
            CACHEWRI := FALSE;
            CACHEBL := 0;
            UNITREAD( DRIVE1, IOCACHE, SIZEOF( IOCACHE), SCNTOCBL, 0);
            MOVELEFT( IOCACHE, SCNTOC, SIZEOF( TSCNTOC))
          END;
          
        XGOTO := XCASTLE;
        WRITE( CHR( 12));
        TEXTMODE;
        MAZESCRN;
        MAZEX    := 0;
        MAZEY    := 0;
        MAZELEV  := 0;
        PARTYCNT := 0;
        DIRECTIO := 0;
        ACMOD2   := 0;
        EXIT( SPECIALS)
      END;
    

(* ========================================================================== *)
(* DISK: Wiz1B.DSK | FILE: SPECIALS2.TEXT                              *)
(* ========================================================================== *)

  
PROCEDURE SPCMISC;  (* P010311 *)
  
    VAR
         MESSAGE  : PACKED ARRAY[ 0..511] OF CHAR;
         
         STRBUFF  : RECORD
                      BUFF: STRING[ 38];
                      ENDMSG : BOOLEAN;
                    END;
                    
         LINECNT  : INTEGER;
         MSGX     : INTEGER;
         MSGBLK   : INTEGER;
         CURMSGBL : INTEGER;
         MSGBLK0  : INTEGER;
         BOUNCEFL : INTEGER; (* MULTIPLE USES;  FIRST CHAR "FEE" 2CG *)
         AUX0     : INTEGER; (* MULTIPLE USES:  EQINDEX, RANDOM 0-6, MSG INDEX
                                                AUX0 *)
         AUX1     : INTEGER; (* MULTIPLE USES:  AUX1, MSG INDEX, ....*)
         AUX2     : INTEGER;
         MAZEFLOR : TMAZE;
  
      
    PROCEDURE DECRYPTM( MSGINDEX: INTEGER);  (* P010312 *)
    
      BEGIN
        MSGBLK := MSGINDEX DIV 12;
        MSGX := 42 * (MSGINDEX MOD 12);
        IF MSGBLK <> CURMSGBL THEN
          BEGIN
            UNITREAD( DRIVE1, MESSAGE, BLOCKSZ, MSGBLK0 + MSGBLK, 0);
            CURMSGBL := MSGBLK
          END;
        MOVELEFT( MESSAGE[ MSGX], STRBUFF.BUFF, 42)
      END;
    
    
    PROCEDURE DOMSG( MSGLINEX: INTEGER;   (* P010313 *)
                     PRESSRET: BOOLEAN);
    
    
      PROCEDURE DO1LINE;  (* P010314 *)
      
        BEGIN
          IF LINECNT = 15 THEN
            BEGIN
              CLRRECT( 13, 6, 26, 4);
              MVCURSOR( 19, 7);
              PRINTSTR( '[RET] FOR MORE');
              UNITCLEAR( 1);
              REPEAT
                GETKEY
              UNTIL INCHAR = CHR( CRETURN);
              CLRRECT( 13, 6, 26, 4);
              CLRRECT( 1, 11, 38, 4);
              LINECNT := 11;
            END;
          DECRYPTM( MSGLINEX);
          MVCURSOR( 1, LINECNT);
          PRINTSTR( STRBUFF.BUFF);
          MSGLINEX := MSGLINEX + 1;
          LINECNT := LINECNT + 1
        END;  (* DO1LINE *)
        
        
      BEGIN (* DOMSG *)
        LINECNT := 11;
        REPEAT
          DO1LINE
        UNTIL STRBUFF.ENDMSG;
        IF PRESSRET THEN
          BEGIN
            CLRRECT( 13, 6, 26, 4);
            MVCURSOR( 21, 7);
            PRINTSTR( 'PRESS [RET]');
            UNITCLEAR( 1);
            REPEAT
              GETKEY;
            UNTIL INCHAR = CHR( CRETURN);
            CLRRECT( 13, 6, 26, 4)
          END;
      END;  (* DOMSG *)
      
      
    FUNCTION GOTITEM( CHARX: INTEGER;  (* P010315 *)
                      ITEMX: INTEGER) : BOOLEAN;
    
      VAR
           POSSX : INTEGER;
           
      BEGIN
        GOTITEM := FALSE;
        WITH CHARACTR[ CHARX] DO
          BEGIN
            IF POSS.POSSCNT = 8 THEN
              EXIT( GOTITEM);
            FOR POSSX := 1 TO POSS.POSSCNT DO
              IF POSS.POSSESS[ POSSX].EQINDEX = ITEMX THEN
                EXIT( GOTITEM);
            CLRRECT( 1, 11, 38, 4);
            MVCURSOR( 1, 11);
            PRINTSTR( CHARACTR[ CHARX].NAME);
            PRINTSTR( ' GOT ITEM');
            POSSX := POSS.POSSCNT + 1;
            POSS.POSSCNT := POSSX;
            POSS.POSSESS[ POSSX].EQINDEX := ITEMX;
            POSS.POSSESS[ POSSX].EQUIPED := FALSE;
            POSS.POSSESS[ POSSX].CURSED  := FALSE
          END;
        GOTITEM := TRUE
      END;
      
      
    PROCEDURE TRYGET;  (* P010316 *)
    
      VAR
           GOTONE : BOOLEAN;
           CHARX  : INTEGER;
           
      BEGIN
        GOTONE := FALSE;
        FOR CHARX := 0 TO PARTYCNT - 1 DO
          IF NOT GOTONE THEN
            GOTONE := GOTITEM( CHARX, AUX0)
      END;
      
      
    PROCEDURE WHOWADE;  (* P010317 *)
    
      VAR
           WADEX : INTEGER;
           
           
      PROCEDURE MAKWORSE( THISSTAT: TSTATUS);  (* P010318 *)
      
        BEGIN
          IF THISSTAT > CHARACTR[ WADEX].STATUS THEN
            CHARACTR[ WADEX].STATUS := THISSTAT
        END;
        
        
      BEGIN (* WHOWADE *)
        CLRRECT( 1, 11, 38, 4);
        MVCURSOR( 2, 12);
        PRINTSTR( '#) TO WADE, [RET] EXITS');
        WADEX := GETCHARX( FALSE, '');
        IF WADEX < 0 THEN
          EXIT( WHOWADE);
          
        IF AUX0 = -1 THEN
          AUX0 := RANDOM MOD 7;
          
        CASE AUX0 OF
          0:  BEGIN
                IF CHARACTR[ WADEX].STATUS < DEAD THEN
                  BEGIN
                    CHARACTR[ WADEX].STATUS := OK;
                    CHARACTR[ WADEX].HPMAX  := CHARACTR[ WADEX].HPMAX - 8;
                    CHARACTR[ WADEX].HPLEFT := CHARACTR[ WADEX].HPMAX;
                    IF CHARACTR[ WADEX].HPMAX <= 0 THEN
                      MAKWORSE( DEAD);
                  END;
              END;
              
          1:  BEGIN
                IF (CHARACTR[ WADEX].ATTRIB[ IQ] = 3) OR
                   (CHARACTR[ WADEX].ATTRIB[ PIETY] = 3) THEN
                  MAKWORSE( DEAD)
                ELSE
                  BEGIN
                    CHARACTR[ WADEX].AGE := CHARACTR[ WADEX].AGE - 52;
                    CHARACTR[ WADEX].ATTRIB[ IQ] :=
                      CHARACTR[ WADEX].ATTRIB[ IQ] - 1;
                    CHARACTR[ WADEX].ATTRIB[ PIETY] :=
                      CHARACTR[ WADEX].ATTRIB[ PIETY] - 1
                  END
              END;
            
          2:  CHARACTR[ WADEX].LOSTXYL.POISNAMT[ 1] := 1;
          3:  MAKWORSE( ASLEEP);
          4:  MAKWORSE( PLYZE);
          5:  MAKWORSE( STONED);
          6:  IF CHARACTR[ WADEX].STATUS = DEAD THEN
                IF (RANDOM MOD 10 < 3) THEN
                  BEGIN
                    CHARACTR[ WADEX].STATUS := OK;
                    CHARACTR[ WADEX].HPLEFT := CHARACTR[ WADEX].HPMAX
                  END
                ELSE
                  CHARACTR[ WADEX].STATUS := ASHES;
        END
      END;  (* WHOWADE *)
      
      
      
    PROCEDURE GETYN;  (* P010319 *)
    
      BEGIN
        CLRRECT( 1, 11, 38, 4);
        MVCURSOR( 1, 11);
        PRINTSTR( 'SEARCH (Y/N) ?');
        REPEAT
          GETKEY
        UNTIL (INCHAR = 'Y') OR (INCHAR = 'N');
        IF INCHAR = 'N' THEN
          EXIT( SPECIALS);
        IF AUX0 > 0 THEN
          BEGIN
            ATTK012 := 0;
            ENEMYINX := AUX0;
            XGOTO := XCOMBAT
          END
        ELSE
          BEGIN
            AUX0 := ABS( AUX0);
            TRYGET
          END;
      END;
    
      
    PROCEDURE BOUNCEBK;  (* P01031A *)
    
      BEGIN
        CASE DIRECTIO OF
          0:  MAZEY := MAZEY - 1;
          1:  MAZEX := MAZEX - 1;
          2:  MAZEY := MAZEY + 1;
          3:  MAZEX := MAZEX + 1;
        END;
        MAZEY := (MAZEY + 20) MOD 20;
        MAZEX := (MAZEX + 20) MOD 20;
        IF AUX1 >= 0 THEN
            DOMSG( AUX1, FALSE)
      END;
  
  
    PROCEDURE ITM2PASS;  (* P01031B *)
    
    VAR
         POSX  : INTEGER;
         CHARX : INTEGER;
         
      BEGIN
        FOR CHARX := 0 TO PARTYCNT - 1 DO
          WITH CHARACTR[ CHARX] DO
            BEGIN
              FOR POSX := 1 TO POSS.POSSCNT DO
                IF POSS.POSSESS[ POSX].EQINDEX = AUX0 THEN
                  EXIT( SPECIALS)
            END;
        BOUNCEBK
      END;
      
      
    PROCEDURE CHKALIGN;  (* P01031C *)
    
      VAR
           CHARX : INTEGER;
           
      BEGIN
        FOR CHARX := 0 TO PARTYCNT - 1 DO
          WITH CHARACTR[ CHARX] DO
            BEGIN
              CASE ALIGN OF
              
                   GOOD:  IF (AUX0 = 0) OR (AUX0 = 2) OR
                             (AUX0 = 4) OR (AUX0 = 6) THEN
                            BOUNCEBK;
                        
                NEUTRAL:  IF (AUX0 = 0) OR (AUX0 = 1) OR
                             (AUX0 = 4) OR (AUX0 = 5) THEN
                            BOUNCEBK;
                        
                   EVIL:  IF (AUX0 < 4) THEN
                            BOUNCEBK
              END
            END
      END;  (* CHKALIGN *)
      
      
    PROCEDURE CHKAUX0;  (* P01031D *)
    
      BEGIN
        IF AUX0 = 99 THEN
          LIGHT := LIGHT + 50
        ELSE IF AUX0 = -99 THEN
          LIGHT := 0
        ELSE
          ACMOD2 := AUX0
      END;  (* CHKAUX0 *)
      
      
    PROCEDURE BCK2SHOP;  (* P01031E *)
    
      BEGIN
        MAZELEV := 0;
        WRITE( CHR(12));
        XGOTO := XNEWMAZE
      END;
        
        
    PROCEDURE RIDDLES;  (* P01031F *)
    
      VAR
           ANSWER : STRING[ 40];
    
      BEGIN
        CLRRECT( 1, 11, 38, 4);
        MVCURSOR( 1, 11);
        PRINTSTR( 'ANSWER ?');
        GETSTR( ANSWER, 1, 13);
        DECRYPTM( AUX0);
        CLRRECT( 1, 11, 38, 4);
        MVCURSOR( 1, 11);
        IF STRBUFF.BUFF <> ANSWER THEN
          BEGIN
            AUX1 := - 1;
            PRINTSTR( 'WRONG!');
            BOUNCEBK
          END
        ELSE
          PRINTSTR( 'RIGHT!')
      END;


    PROCEDURE FEEIS;  (* P010320 *)
    
      VAR
           GOLDTOT : TWIZLONG;
           FEE     : TWIZLONG;
    
    
      PROCEDURE FEE2LONG;  (* P010321 *)
      
        VAR
             MULT10 : INTEGER;
             STRX   : INTEGER;
      
        BEGIN
          IF STRBUFF.BUFF[ 1] >= '@' THEN
            BEGIN
              BOUNCEFL := ORD( STRBUFF.BUFF[ 1]) - ORD( 'A') + 1;
              STRBUFF.BUFF := COPY( STRBUFF.BUFF, 2,
                                    ORD( STRBUFF.BUFF[ 0]) - 1)
            END
          ELSE
            BOUNCEFL := 0;
          FILLCHAR( FEE, 6, 0);
          MULT10 := 10;
          FOR STRX := 1 TO LENGTH( STRBUFF.BUFF) DO
            BEGIN
              MULTLONG( FEE, MULT10);
              FEE.LOW := FEE.LOW + ORD( STRBUFF.BUFF[ STRX]) - ORD( '0')
            END
        END;
        
        
      PROCEDURE CHKGOLD;  (* P010322 *)
      
        VAR
             CHARX : INTEGER;
      
        BEGIN
          FILLCHAR( GOLDTOT, 6, 0);
          FOR CHARX := 0 TO PARTYCNT - 1 DO
            ADDLONGS( GOLDTOT, CHARACTR[ CHARX].GOLD);
          IF TESTLONG( GOLDTOT, FEE) <> -1 THEN
            EXIT( CHKGOLD);
          PRINTSTR( 'NOT ENOUGH $');
          IF BOUNCEFL = 0 THEN
            BOUNCEBK;
          EXIT( SPECIALS)
        END;
        
        
      PROCEDURE PAYGOLD;  (* P010323 *)
      
        VAR
             CHARX : INTEGER;
      
        BEGIN
          FILLCHAR( GOLDTOT, 6, 0);
          FOR CHARX := 0 TO PARTYCNT - 1 DO
            BEGIN
              IF FEE <> GOLDTOT THEN
                IF TESTLONG( FEE, CHARACTR[ CHARX].GOLD) = 1 THEN
                  BEGIN
                    SUBLONGS( FEE, CHARACTR[ CHARX].GOLD);
                    FILLCHAR( CHARACTR[ CHARX].GOLD, 6, 0)
                  END
                ELSE
                  BEGIN
                    SUBLONGS( CHARACTR[ CHARX].GOLD, FEE);
                    FILLCHAR( FEE, 6, 0)
                  END
            END;
          PRINTSTR( 'THANKS!')
        END;
        
        
      BEGIN (* FEEIS *)
        DECRYPTM( AUX0);
        FEE2LONG;
        CLRRECT( 1, 11, 38, 4);
        MVCURSOR( 1, 11);
        PRINTSTR( 'FEE IS ');
        PRINTSTR( STRBUFF.BUFF);
        MVCURSOR( 1, 13);
        PRINTSTR( 'PAY (Y/N) ?');
        REPEAT
          GETKEY
        UNTIL (INCHAR = 'Y') OR (INCHAR = 'N');
        AUX1 := -1;
        IF INCHAR = 'N' THEN
          BEGIN
            IF BOUNCEFL = 0 THEN
               BOUNCEBK;
            EXIT( SPECIALS)
          END
        ELSE
          BEGIN
            CLRRECT( 1, 11, 38, 4);
            MVCURSOR( 1, 11);
            CHKGOLD;
            PAYGOLD;
            IF BOUNCEFL > 0 THEN
              BEGIN
                MAZEX   := MAZEFLOR.AUX2[ BOUNCEFL];
                MAZEY   := MAZEFLOR.AUX1[ BOUNCEFL];
                MAZELEV := MAZEFLOR.AUX0[ BOUNCEFL];
                XGOTO := XNEWMAZE
              END
          END
      END;
      
      
    PROCEDURE LOOKOUT;  (* P010324 *)
    
      VAR
           Y  : INTEGER;
           X  : INTEGER;
           Y2 : INTEGER;
           X2 : INTEGER;
           
      BEGIN
        FOR X2 := - AUX0 TO AUX0 DO
          FOR Y2 := - AUX0 TO AUX0 DO
            BEGIN
              X := (MAZEX + X2 + 20) MOD 20;
              Y := (MAZEY + Y2 + 20) MOD 20;
              FIGHTMAP[ X, Y] := TRUE
            END;
        FIGHTMAP[ MAZEX, MAZEY] := FALSE
      END;
      
      
    PROCEDURE SWITCHLOC;  (* P010325 *)
    
      VAR
           BEENHERE : PACKED ARRAY[ 0..19] OF PACKED ARRAY[ 0..19] OF BOOLEAN;
           UNUSED1  : INTEGER;
           UNUSED2  : INTEGER;
           UNUSED3  : INTEGER;
           DOORCNT  : INTEGER;  (* DOORS GONE THROUGH *)
    
    
      PROCEDURE SWITCH( VAR FIRST:  INTEGER;  (* P010326 *)
                        VAR SECOND: INTEGER);
      
        VAR
             SAVE : INTEGER;
      
        BEGIN
          SAVE   := FIRST;
          FIRST  := SECOND;
          SECOND := SAVE
        END;
        
        
      PROCEDURE FINDDOOR;  (* P010327 *)
    
        VAR
             LIMITMOV : INTEGER;  (* LIMIT DOORS (ROOMS) MOVED THROUGH *)
    
    
        FUNCTION P010328( X : INTEGER; Y : INTEGER) : BOOLEAN;  (* P010328 *)
        
        
          PROCEDURE TRYADJ( X : INTEGER; Y : INTEGER);  (* P010329 *)
            
            
            PROCEDURE CHK4DOOR( WALLTYPE : TWALL;  (* P01032A *)
                                MOVETOX  : INTEGER;
                                MOVETOY  : INTEGER);
            
              BEGIN (* CHK4DOOR *)
                IF (WALLTYPE = OPEN) OR (WALLTYPE = WALL) THEN
                  EXIT( CHK4DOOR);
                IF WALLTYPE = HIDEDOOR THEN
                  IF (RANDOM MOD 100) < 65 THEN
                    EXIT( CHK4DOOR);
                    
                (* EITHER A DOOR OR SOMETIMES A HIDDEN DOOR *)
                    
                MOVETOX := (MOVETOX + 20) MOD 20;
                MOVETOY := (MOVETOY + 20) MOD 20;
                IF (DOORCNT = 0) OR
                  (NOT (BEENHERE[ MOVETOX][ MOVETOY])
                   AND ((RANDOM MOD 100) > (65 - LIMITMOV))) THEN
                   BEGIN
                     SAVEX := X;
                     SAVEY := Y;
                     MAZEX := MOVETOX;
                     MAZEY := MOVETOY;
                     DOORCNT := DOORCNT + 1;
                     P010328 := TRUE;
                     EXIT( P010328)
                   END;
              END;  (* CHK4DOOR *)
              
              
            BEGIN (* TRYADJ *)
              X := (X + 20) MOD 20;
              Y := (Y + 20) MOD 20;
              IF BEENHERE[ X][ Y] THEN
                EXIT( TRYADJ);
              IF MAZEFLOR.SQRETYPE[ MAZEFLOR.SQREXTRA[ X][ Y]] <> NORMAL THEN
                BEGIN
                  MAZEX := X;
                  MAZEY := Y;
                  EXIT( FINDDOOR)
                END;
                
              BEENHERE[ X][ Y] := TRUE;
              
              CHK4DOOR( MAZEFLOR.N[ X][ Y], X, Y + 1);
              CHK4DOOR( MAZEFLOR.S[ X][ Y], X, Y - 1);
              CHK4DOOR( MAZEFLOR.E[ X][ Y], X + 1, Y);
              CHK4DOOR( MAZEFLOR.W[ X][ Y], X - 1, Y);
              
              IF MAZEFLOR.N[ X][ Y] = OPEN THEN
                TRYADJ( X, Y + 1);
              IF MAZEFLOR.W[ X][ Y] = OPEN THEN
                TRYADJ( X - 1, Y);
              IF MAZEFLOR.E[ X][ Y] = OPEN THEN
                TRYADJ( X + 1, Y);
              IF MAZEFLOR.S[ X][ Y] = OPEN THEN
                TRYADJ( X, Y - 1)
            END;  (* TRYADJ *)
        
        
          BEGIN (* P010328 *)
            P010328 := FALSE;
            TRYADJ( X, Y)
          END;  (* P010328 *)
          
          
          
        BEGIN  (* FINDDOOR *)
          LIMITMOV := 0;
          WHILE  (DOORCNT = 0) OR
                 ((RANDOM MOD 65) >  LIMITMOV) DO
            BEGIN
              IF NOT P010328( MAZEX, MAZEY) THEN
                EXIT( FINDDOOR);
              LIMITMOV := LIMITMOV + 10;
            END;
        END;
      
      
      BEGIN  (* SWITCHLOC *)
        XGOTO2 := XCOMBAT;
        XGOTO := XRUNNER;
        FILLCHAR( BEENHERE, 80, 0);
        DOORCNT := 0;
        MAZEFLOR.SQREXTRA[ MAZEX][ MAZEY] := 0;
        FINDDOOR;
        DIRECTIO := RANDOM MOD 4;
        EXIT( SPECIALS);
      END;  (* SWITCHLOC *)
      
      
    BEGIN  (* SPCMISC *)
      MOVELEFT( IOCACHE[ GETREC( ZMAZE, MAZELEV - 1, SIZEOF( TMAZE))],
                MAZEFLOR,
                SIZEOF( TMAZE));
      BOUNCEFL := SPCINDEX;
      IF BOUNCEFL = 0 THEN
        SWITCHLOC;
      XGOTO2 := XSCNMSG;
      CLRRECT( 1, 11, 38, 4);
      MSGBLK0 := FINDFILE( DRIVE1, 'SCENARIO.MESGS');
      IF MSGBLK0 < 0 THEN
        BEGIN
          MVCURSOR( 1, 11);
          PRINTSTR( 'MESGS LOST');
          EXIT( SPECIALS);
        END;
      CURMSGBL := 0;
      UNITREAD( DRIVE1, MESSAGE, BLOCKSZ, MSGBLK0, 0);
      AUX2 := MAZEFLOR.AUX2[ BOUNCEFL];
      AUX1 := MAZEFLOR.AUX1[ BOUNCEFL];
      AUX0 := MAZEFLOR.AUX0[ BOUNCEFL];
      XGOTO := XRUNNER;
      IF AUX2 = 0 THEN
        EXIT( SPECIALS);
      IF (AUX2 = 1) OR (AUX2 = 4) OR (AUX2 = 8) THEN
        BEGIN
          IF AUX0 = 0 THEN
            EXIT( SPECIALS)
          ELSE
            BEGIN
              IF AUX2 <> 4 THEN
                BEGIN
                  IF AUX0 > 0 THEN
                    MAZEFLOR.AUX0[ BOUNCEFL] := AUX0 - 1;
                  IF AUX0 = 1 THEN
                    MAZEFLOR.SQRETYPE[ BOUNCEFL] := NORMAL;
                END
              ELSE
                IF AUX0 < 0 THEN
                  IF AUX0 > -1000 THEN
                    MAZEFLOR.AUX0[ BOUNCEFL] := 0
                  ELSE
                    AUX0 := AUX0 + 1000;
              MOVELEFT( MAZEFLOR,
                        IOCACHE[ GETRECW( ZMAZE, MAZELEV - 1, SIZEOF( TMAZE))],
                        SIZEOF( TMAZE))
            END
        END;
        
      CLRRECT( 1, 11, 38, 4);
      IF NOT ( (AUX2 = 5) OR (AUX2 = 6) ) THEN
        DOMSG( AUX1,
                 (AUX2 = 2)  OR (AUX2 = 3) OR (AUX2 = 4) OR
                 (AUX2 = 10) OR (AUX2 = 11) OR (AUX2 = 12));
      CASE AUX2 OF
         2: TRYGET;
         3: WHOWADE;
         4: GETYN;
         5: ITM2PASS;
         6: CHKALIGN;
         7: CHKAUX0;
         8: BCK2SHOP;
         9: LOOKOUT;
        10: RIDDLES;
        11: FEEIS;
      END;
    END;  (* SPCMISC *)
    
  BEGIN  (* SPECIALS *)
  
    IF XGOTO = XINSAREA THEN
      INSPECT;
    XGOTO := XGOTO2;
    SPCINDEX := LLBASE04;
    IF SPCINDEX < 0 THEN
      INITGAME
    ELSE
      SPCMISC

  END;  (* SPECIALS *)

(* ========================================================================== *)
(* DISK: Wiz1B.DSK | FILE: COMBAT.TEXT                                 *)
(* ========================================================================== *)

  SEGMENT PROCEDURE COMBAT;  (* P010401 *)

    CONST
    
        HALITO   =  4178;
        MOGREF   =  2409;
        KATINO   =  3983;
        DUMAPIC  =  3245;
        
        DILTO    =  3340;
        SOPIC    =  1953;
        
        MAHALITO =  6181;
        MOLITO   =  4731;
        
        MORLIS   =  4744;
        DALTO    =  3180;
        LAHALITO =  6156;
        
        MAMORLIS =  7525;
        MAKANITO =  6612;
        MADALTO  =  4925;
        
        LAKANITO =  6587;
        ZILWAN   =  4573;
        MASOPIC  =  3990;
        HAMAN    =  1562;
        
        MALOR    =  3128;
        MAHAMAN  =  2597;
        TILTOWAI = 11157;
        
        
        KALKI    =  1449;
        DIOS     =  2301;
        BADIOS   =  3675;
        MILWA    =  2889;
        PORFIC   =  2287;
        
        MATU     =  3139;
        CALFO    =     0; (* 1717 *)
        MANIFO   =  2619;
        MONTINO  =  5970;
        
        LOMILWA  =  5333;
        DIALKO   =  2718;
        LATUMAPI =  6491;
        BAMATU   =  5169;
        
        DIAL     =   761;
        BADIAL   =  1253;
        LATUMOFI =  9463;
        MAPORFIC =  4322;
        
        DIALMA   =  1614;
        BADIALMA =  2446;
        LITOKAN  =  4396;
        KANDI    =  1185; (* 1885 *)
        DI       =   180;
        BADI     =   382;
        
        LORTO    =  4296;
        MADI     =   547;
        MABADI   =   759;
        LOKTOFEI =  8330;
        
        MALIKTO  =  5514;
        KADORTO  =  6673;
        
    VAR
         CINITFL1 : INTEGER;
         SURPRISE : INTEGER;
         DONEFIGH : BOOLEAN;
         PREBATOR : ARRAY[ 0..5] OF INTEGER;
         DRAINED  : ARRAY[ 0..5] OF BOOLEAN;
         BATTLERC : ARRAY[ 0..4] OF TENEMY2;

    
(* CINIT *)
    
    SEGMENT PROCEDURE CINIT;  (* P010501 *)
      
      
      PROCEDURE ENEMYPIC( ENEMYID : INTEGER);  (* P010502 *)
      
        VAR
             PICLINE  : INTEGER;
             UNUSED   : INTEGER;
             SCRNADDR : RECORD CASE INTEGER OF
                 1: (I: INTEGER);
                 2: (P: ^INTEGER);
               END;
                     
        BEGIN
          CLRPICT( 0, 0, 0, 100);  (* CLEAR PICTURE *)
          IF ENEMYID < 0 THEN
            BEGIN
              ENEMYID := 0;  (* NO MONSTER PICTURE (?) SO USE FIRST ONE *)
              WRITE( CHR(7)) (*   AND RING THE BELL                     *)
            END;
          FOR PICLINE := 23 TO 72 DO
            BEGIN
              SCRNADDR.I := (8193 +  (1024 *  (PICLINE MOD 8))) +
                            (128 * ((PICLINE MOD 64) DIV 8)) +
                            40 * (PICLINE DIV 64);
              MOVELEFT( IOCACHE[ ENEMYID], SCRNADDR.P^, 10);
              ENEMYID := ENEMYID + 10    (* 10 BYTES === 70 PIXELS PER LINE *)
            END;
        END;
        
        
      PROCEDURE SVREWARD;  (* P010503 *)
      
        VAR
             BATRESLT : TBATRSLT;
             UNUSEDX  : INTEGER;
             X        : INTEGER;
             
             
        BEGIN
          FOR X := 0 TO PARTYCNT - 1 DO
            IF (CHARACTR[ X].STATUS = ASLEEP) OR
               (CHARACTR[ X].STATUS = AFRAID) THEN
              CHARACTR[ X].STATUS := OK;
              
          MOVELEFT( IOCACHE[ GETREC( ZZERO, 0, SIZEOF( SCNTOC))],
                    LLBASE04,
                    2);
          MOVELEFT( DRAINED, BATRESLT.DRAINED, 12);
          FOR X := 1 TO 4 DO
            BEGIN
              BATRESLT.ENMYID[ X] := BATTLERC[ X].A.ENEMYID;
              BATRESLT.ENMYCNT[ X] := BATTLERC[ X].A.ENMYCNT
            END;
            
          MOVELEFT( BATRESLT, IOCACHE, SIZEOF( TBATRSLT))
        END;
        
        
        
      PROCEDURE INITATTK;  (* P010504 *)
      
        VAR
             UNUSEDWW : INTEGER;
             UNUSEDXX : INTEGER;
             UNUSEDYY : INTEGER;
             UNUSEDZZ : INTEGER;
             CHARX    : INTEGER;
             GROUPI   : INTEGER;
      
      
        PROCEDURE INITGRUP;  (* P010505 *)
        
          PROCEDURE ENGROUPS( ENMYI:    INTEGER;     (* P010506 *)
                              ENMYGRUP: INTEGER);
          
            BEGIN
              REPEAT
                MOVELEFT( IOCACHE[ GETREC( ZENEMY, ENMYI, SIZEOF( TENEMY))],
                          BATTLERC[ ENMYGRUP].B,
                          SIZEOF( TENEMY));
                          
                IF BATTLERC[ ENMYGRUP].B.UNIQUE = 0 THEN
                  ENMYI := BATTLERC[ ENMYGRUP].B.ENMYTEAM;
                
              UNTIL BATTLERC[ ENMYGRUP].B.UNIQUE <> 0;
              
              BATTLERC[ ENMYGRUP].A.ENEMYID := ENMYI;
              IF ENMYGRUP < 4 THEN
                IF BATTLERC[ ENMYGRUP].B.ENMYTEAM >= 0 THEN
                  IF ENMYGRUP <= MAZELEV THEN
                    IF RANDOM MOD 100 < BATTLERC[ ENMYGRUP].B.TEAMPERC THEN
                      ENGROUPS( BATTLERC[ ENMYGRUP].B.ENMYTEAM, ENMYGRUP + 1)
            END;
            
            
            
          FUNCTION ENEMYCNT( HPREC: THPREC) : INTEGER;  (* P010507 *)
          
            BEGIN
              LLBASE04 := HPREC.HPMINAD;
              WHILE HPREC.LEVEL > 0 DO
                BEGIN
                  LLBASE04 := LLBASE04 + (RANDOM MOD HPREC.HPFAC) + 1;
                  HPREC.LEVEL := HPREC.LEVEL - 1
                END;
              ENEMYCNT := LLBASE04
            END;
            
        
          BEGIN (* INITGRUP *)
            FOR GROUPI := 1 TO 4 DO
              BEGIN
                BATTLERC[ GROUPI].A.ENMYCNT  := 0;
                BATTLERC[ GROUPI].A.ALIVECNT := 0;
                BATTLERC[ GROUPI].A.ENEMYID  := -1
              END;
            ENGROUPS( ENEMYINX, 1);
            
            ENEMYINX := BATTLERC[ 1].A.ENEMYID;
            ENEMYPIC( GETREC( ZSPCCHRS, BATTLERC[ 1].B.PIC, 512));
            
            FOR GROUPI := 1 TO 4 DO
              BEGIN
                IF BATTLERC[ GROUPI].A.ENEMYID <> -1 THEN
                  BEGIN
                    BATTLERC[ GROUPI].A.ENMYCNT := 
                      ENEMYCNT( BATTLERC[ GROUPI].B.CALC1);
                    IF BATTLERC[ GROUPI].A.ENMYCNT > (4 + MAZELEV) THEN
                      BATTLERC[ GROUPI].A.ENMYCNT := 4 + MAZELEV;
                    IF BATTLERC[ GROUPI].A.ENMYCNT > 9 THEN
                      BATTLERC[ GROUPI].A.ENMYCNT := 9;
                    IF BATTLERC[ GROUPI].A.ENMYCNT < 1 THEN
                      BATTLERC[ GROUPI].A.ENMYCNT := 1;
                    BATTLERC[ GROUPI].A.ALIVECNT :=
                      BATTLERC[ GROUPI].A.ENMYCNT;
                    BATTLERC[ GROUPI].A.IDENTIFI := FALSE;
                    
                    FOR CHARX := 0 TO (BATTLERC[ GROUPI].A.ENMYCNT - 1) DO
                      WITH BATTLERC[ GROUPI].A.TEMP04[ CHARX] DO
                        BEGIN
                          ARMORCL  := 0;
                          INAUDCNT := 0;
                          HPLEFT   :=
                                    ENEMYCNT( BATTLERC[ GROUPI].B.HPREC);
                          STATUS   := OK
                        END
                  END
                END;
                
          END;  (* INITGRUP *)
        
        
        PROCEDURE INTPARTY;  (* P010508 *)
        
          BEGIN
            BATTLERC[ 0].A.ENMYCNT := PARTYCNT;
            BATTLERC[ 0].A.ALIVECNT := PARTYCNT;
            FOR CHARX := 0 TO (PARTYCNT - 1) DO
              BEGIN
                WITH BATTLERC[ 0].A.TEMP04[ CHARX] DO
                  BEGIN
                    ARMORCL  := 0;
                    INAUDCNT := 0;
                    HPLEFT   := CHARACTR[ CHARX].HPLEFT;
                    STATUS   := CHARACTR[ CHARX].STATUS;
                    CHARACTR[ CHARX].WEPVSTY3[ 1] :=
                      CHARACTR[ CHARX].WEPVSTY3[ 0];
                    CHARACTR[ CHARX].WEPVSTY2[ 1] :=
                      CHARACTR[ CHARX].WEPVSTY2[ 0]
                  END
              END
          END;
          
          
        PROCEDURE FRIENDLY;  (* P010509 *)
        
          VAR
              GOODLEAV : BOOLEAN; (* MULTIPLE USES *)
              UNUSEDYY : BOOLEAN;
              ZERO99   : INTEGER;
              INDEX    : INTEGER;
        
          BEGIN (* FRIENDLY *)
            GOODLEAV := FALSE;
            FOR INDEX := 0 TO PARTYCNT - 1 DO
              BEGIN
                GOODLEAV := GOODLEAV OR (CHARACTR[ INDEX].ALIGN = GOOD)
              END;
            IF NOT GOODLEAV THEN
              EXIT( FRIENDLY);
            
            ZERO99  := RANDOM MOD 100;
            INDEX := 50;
            CASE BATTLERC[ 1].B.CLASS OF
              0:  INDEX := 60;
              1:  INDEX := 55;
              2:  INDEX := 65;
              3:  INDEX := 53;
              4:  INDEX := 80;
              
              7:  INDEX := 75;
            END;
            IF (ZERO99 > INDEX) OR (ZERO99 < 50) THEN
              EXIT( FRIENDLY);
              
            FOR INDEX := 1 TO 4 DO
              BATTLERC[ INDEX].A.IDENTIFI := TRUE;
            CLRRECT( 1, 11, 38, 4);
            MVCURSOR( 1, 11);
            PRINTSTR( 'A FRIENDLY GROUP OF ');
            PRINTSTR( BATTLERC[ 1].B.NAMES);
            PRINTSTR( '.');
            MVCURSOR( 1, 12);
            PRINTSTR( 'THEY HAIL YOU IN WELCOME!');
            MVCURSOR( 1, 14);
            PRINTSTR( 'YOU MAY F)IGHT OR L)EAVE IN PEACE.');
            SURPRISE := 0;
            REPEAT
              GETKEY
            UNTIL (INCHAR = 'F') OR (INCHAR = 'L');
            IF INCHAR = 'L' THEN
              BEGIN
                XGOTO := XRUNNER;
                EXIT( COMBAT)
              END;
            FOR INDEX := 0 TO PARTYCNT - 1 DO
              IF CHARACTR[ INDEX].ALIGN = GOOD THEN
                IF (RANDOM MOD 2000) = 565 THEN
                  CHARACTR[ INDEX].ALIGN := EVIL
          END;  (* FRIENDLY *)
        
        
        BEGIN  (* INITATTK *)
          CLRRECT( 13, 1, 26, 4);
          CLRRECT( 13, 6, 26, 4);
          CLRRECT( 1, 11, 38, 4);
          INITGRUP;
          INTPARTY;
          FILLCHAR( DRAINED, 12, 0);
          FOR LLBASE04 := 0 TO PARTYCNT - 1 DO
            PREBATOR[ LLBASE04] := CHARDISK[ LLBASE04];
          IF (RANDOM MOD 100) > 80 THEN
            SURPRISE := 1
          ELSE IF (RANDOM MOD 100) > 80 THEN
            SURPRISE := 2
          ELSE
            SURPRISE := 0;
          FRIENDLY
        END;  (* INITATTK *)
        
      
      BEGIN (* CINIT *)
        IF CINITFL1 = 0 THEN
          INITATTK
        ELSE
          SVREWARD
      END;  (* CINIT *)
  

(* ========================================================================== *)
(* DISK: Wiz1B.DSK | FILE: COMBAT2.TEXT                                *)
(* ========================================================================== *)

    SEGMENT PROCEDURE CUTIL;


      PROCEDURE CACTION;  (* P010602 *)
      
        VAR
             SPLGRCNT : ARRAY[ 0..5] OF INTEGER;
             BDISPELL : BOOLEAN;
             MYCHARX  : INTEGER;
             AGIL1TEN : INTEGER;
             
          
        PROCEDURE WHICHGRP( SOLICIT:   STRING;   (* P010603 *)
                            SPELLHSH:  INTEGER);
                            
        
          BEGIN
            IF BATTLERC[ 2].A.ALIVECNT = 0 THEN
              BEGIN
                BATTLERC[ 0].A.TEMP04[ MYCHARX].VICTIM := 1;
                BATTLERC[ 0].A.TEMP04[ MYCHARX].SPELLHSH := SPELLHSH;
                EXIT( WHICHGRP)
              END;
            MVCURSOR( 26 - ( LENGTH( SOLICIT) DIV 2), 8);
            PRINTSTR( SOLICIT);
            REPEAT
              GETKEY
            UNTIL ((INCHAR >= '1') AND (INCHAR < '5')) OR
                   (INCHAR = CHR( CRETURN));
            IF INCHAR = CHR( CRETURN) THEN
              BEGIN
                BATTLERC[ 0].A.TEMP04[ MYCHARX].SPELLHSH := -999;
                EXIT( WHICHGRP)
              END;
            IF BATTLERC[ ORD( INCHAR) - ORD( '0')].A.ALIVECNT = 0 THEN
              BEGIN
                BATTLERC[ 0].A.TEMP04[ MYCHARX].SPELLHSH := -999;
                EXIT( WHICHGRP)
              END;
            BATTLERC[ 0].A.TEMP04[ MYCHARX].VICTIM := ORD( INCHAR) - ORD( '0');
            BATTLERC[ 0].A.TEMP04[ MYCHARX].SPELLHSH := SPELLHSH;
            CLRRECT( 13, 8, 26, 2)
          END;
          
          
        PROCEDURE USEITEM;  (* P010604 *)
        
          VAR
               BUSEABLE : ARRAY[ 1..8] OF BOOLEAN;
               POSSX    : INTEGER;
               OBJECT   : TOBJREC;
        
        
          PROCEDURE READOBJT;  (* P010605 *)
          
            BEGIN
              MOVELEFT( 
                IOCACHE[ GETREC(
                        ZOBJECT,
                        CHARACTR[ MYCHARX].POSS.POSSESS[ POSSX].EQINDEX,
                        SIZEOF( TOBJREC))],
                OBJECT,
                SIZEOF( TOBJREC))
            END;
            
            
          PROCEDURE DSPITEMS;  (* P010606 *)
          
            VAR
                 ITEMCNT : INTEGER;
          
            BEGIN
              CLRRECT( 1, 11, 38, 4);
              ITEMCNT := 0;
              FOR POSSX := 1 TO CHARACTR[ MYCHARX].POSS.POSSCNT DO
                BEGIN
                  BUSEABLE[ POSSX] := FALSE;
                  MVCURSOR( 1 + 19 * ((POSSX - 1) MOD 2),
                           11 + (POSSX - 1) DIV 2);
                  READOBJT;
                  IF OBJECT.SPELLPWR > 0 THEN
                    IF (OBJECT.OBJTYPE = SPECIAL) OR
                       (CHARACTR[ MYCHARX].POSS.POSSESS[ POSSX].EQUIPED) THEN
                      BEGIN
                        ITEMCNT := ITEMCNT + 1;
                        BUSEABLE[ POSSX] := TRUE;
                        PRINTNUM( POSSX, 1);
                        PRINTSTR( ') ');
                        IF CHARACTR[ MYCHARX].POSS.POSSESS[ POSSX].IDENTIF THEN
                          PRINTSTR( OBJECT.NAME)
                        ELSE
                          PRINTSTR( OBJECT.NAMEUNK)
                      END
                END;
              IF ITEMCNT = 0 THEN
                EXIT( USEITEM);
              MVCURSOR( 13, 8);
              PRINTSTR( 'WHICH ITEM (RETURN EXITS)?')
            END;
            
            
          PROCEDURE CHGITEM;  (* P010607 *)
          
            BEGIN
              IF (RANDOM MOD 100) >= OBJECT.CHGCHANC THEN
                EXIT( CHGITEM);
              WITH CHARACTR[ MYCHARX].POSS.POSSESS[ POSSX] DO
                BEGIN
                  EQINDEX := OBJECT.CHANGETO;
                  IDENTIF := FALSE
                END;
            END;
            
            
          PROCEDURE UIGENERC( SPELLHSH: INTEGER);  (* P010608 *)
          
            BEGIN
              BATTLERC[ 0].A.TEMP04[ MYCHARX].SPELLHSH := SPELLHSH;
              BATTLERC[ 0].A.TEMP04[ MYCHARX].VICTIM := -1;
              CHGITEM
            END;
            
            
          PROCEDURE UIPERSON( SPELLHSH: INTEGER);  (* P010609 *)
          
            BEGIN
              MVCURSOR( 15, 8);
              PRINTSTR( 'USE ITEM ON PERSON # ?');
              REPEAT
                GETKEY
              UNTIL (INCHAR >= '1') AND (INCHAR <= CHR( ORD('0') + PARTYCNT));
              BATTLERC[ 0].A.TEMP04[ MYCHARX].VICTIM :=
                 ORD( INCHAR) - ORD('0') - 1;
              BATTLERC[ 0].A.TEMP04[ MYCHARX].SPELLHSH := SPELLHSH;
              CHGITEM
            END;
            
            
          PROCEDURE UIGROUP( SPELLHSH : INTEGER);  (* P01060A *)
          
            BEGIN
              WHICHGRP( 'USE ITEM ON WHAT GROUP # ?', SPELLHSH);
              CHGITEM
            END;
            
            
          BEGIN (* USEITEM *)
            IF CHARACTR[ MYCHARX].POSS.POSSCNT = 0 THEN
              EXIT( USEITEM);
            DSPITEMS;
            
            REPEAT
              GETKEY;
              POSSX := ORD( INCHAR) - ORD( '0');
              IF INCHAR = CHR( CRETURN) THEN
                EXIT( USEITEM)
            UNTIL (POSSX > 0) AND
                  (POSSX <= CHARACTR[ MYCHARX].POSS.POSSCNT) AND
                  (BUSEABLE[ POSSX]);
            READOBJT;
            CLRRECT( 13, 6, 26, 4);
            LLBASE04 := SCNTOC.SPELLHSH[ OBJECT.SPELLPWR];
            CASE SCNTOC.SPELL012[ OBJECT.SPELLPWR] OF
              GENERIC:  UIGENERC( LLBASE04);
               PERSON:  UIPERSON( LLBASE04);
                GROUP:  UIGROUP(  LLBASE04);
            END
          END; (* USEITEM *)
          
          
        PROCEDURE GETSPELL;  (* P01060B *)
        
          VAR
              SPELLNAM : STRING[ 14];
              SPELLCST : INTEGER;
              SPELNAML : INTEGER;
              SPELCHRA : INTEGER;
              SPELNAMI : INTEGER;
        
        
          PROCEDURE DOSPELL;  (* P01060C *)
          
            VAR
                 SPELLX : INTEGER;
                 
                 
            PROCEDURE CASTCHK( SPELLI:  INTEGER;  (* P01060D *)
                               SPELLGR: INTEGER);
            
              BEGIN
                IF CHARACTR[ MYCHARX].SPELLSKN[ SPELLI] THEN
                  IF (SPELLI < 22) AND 
                     (CHARACTR[ MYCHARX].MAGESP[ SPELLGR] > 0) THEN
                       SPLGRCNT[ MYCHARX] := SPELLGR
                  ELSE
                      IF CHARACTR[ MYCHARX].PRIESTSP[ SPELLGR] > 0 THEN
                          SPLGRCNT[ MYCHARX] := SPELLGR + 10;
              
                MVCURSOR( 13, 9);
                IF SPLGRCNT[ MYCHARX] > 0 THEN
                  EXIT( CASTCHK)
                ELSE
                  IF CHARACTR[ MYCHARX].SPELLSKN[ SPELLI] THEN
                    PRINTSTR( 'SPELL POINTS EXHAUSTED')
                  ELSE
                    PRINTSTR( 'YOU DONT KNOW THAT SPELL');
                PAUSE1;
                EXIT( GETSPELL)
              END;
              
              
            PROCEDURE SPGENERC( SPELLI:  INTEGER;  (* P01060E *)
                                SPELLGR: INTEGER);
            
              BEGIN
                CASTCHK( SPELLI, SPELLGR);
                BATTLERC[ 0].A.TEMP04[ MYCHARX].SPELLHSH := SPELLCST;
                BATTLERC[ 0].A.TEMP04[ MYCHARX].VICTIM := -1
              END;
              
              
            PROCEDURE SPPERSON( SPELLI:  INTEGER;  (* P01060F *)
                                SPELLGR: INTEGER);
            
              BEGIN
                CASTCHK( SPELLI, SPELLGR);
                MVCURSOR( 13, 8);
                PRINTSTR( ' CAST SPELL ON PERSON # ?');
                REPEAT
                  GETKEY
                UNTIL (INCHAR >=  '1') AND
                      (ORD (INCHAR) <= ( (ORD('0') + PARTYCNT) ));
                BATTLERC[ 0].A.TEMP04[ MYCHARX].VICTIM := 
                  ORD( INCHAR) - ORD( '0') - 1;
                BATTLERC[ 0].A.TEMP04[ MYCHARX].SPELLHSH := SPELLCST;
                CLRRECT( 13, 8, 26, 1)
              END;
              
              
            PROCEDURE SPGROUP( SPELLI:  INTEGER;  (* P010610 *)
                               SPELLGR: INTEGER);
            
              BEGIN
                CASTCHK( SPELLI, SPELLGR);
                WHICHGRP( 'CAST SPELL ON GROUP #?', SPELLCST)
              END;
              
              
            BEGIN (* DOSPELL *)
              FOR SPELLX := 0 TO 50 DO
                IF SPELLCST = SCNTOC.SPELLHSH[ SPELLX] THEN
                  CASE SCNTOC.SPELL012[ SPELLX] OF
                    GENERIC:  SPGENERC( SPELLX, SCNTOC.SPELLGRP[ SPELLX]);
                     PERSON:  SPPERSON( SPELLX, SCNTOC.SPELLGRP[ SPELLX]);
                      GROUP:  SPGROUP(  SPELLX, SCNTOC.SPELLGRP[ SPELLX]);
                  END
            END;  (* DOSPELL *)
            
            
          BEGIN  (* GETSPELL *)
            MVCURSOR( 13, 8);
            PRINTSTR( 'SPELL NAME ? >');
            GETSTR( SPELLNAM, 27, 8);
            SPELNAML := LENGTH( SPELLNAM);
            IF SPELNAML = 0 THEN
              EXIT( GETSPELL);
            SPELLCST := SPELNAML;
            FOR SPELNAMI := 1 TO SPELNAML DO
              BEGIN
                SPELCHRA := ORD( SPELLNAM[ SPELNAMI]) - 64;
                SPELLCST := SPELLCST + (SPELCHRA * SPELCHRA * SPELNAMI)
              END;
            CLRRECT( 13, 8, 26, 1);
            DOSPELL
          END; (* GETSPELL *)
          
          
        PROCEDURE RUNAWAY;  (* P010611 *)
        
          VAR
               TEMP : INTEGER;  (* MULTIPLE USES *)
        
        
          PROCEDURE RUNFAILD;  (* P010612 *)
          
            BEGIN
              FOR TEMP := 0 TO PARTYCNT - 1 DO
                BATTLERC[ 0].A.TEMP04[ TEMP].AGILITY := -1;
              EXIT( CACTION)
            END;
            
            
          BEGIN (* RUNAWAY *)
            CLRRECT( 13, 6, 26, 4);
            TEMP := 38 - 3 * MAZELEV;
            IF PARTYCNT < 4 THEN
              TEMP := TEMP + 20 - 5 * PARTYCNT;
            IF BASE12.MYSTRENG > ENSTRENG THEN
              TEMP := TEMP + 20;
            IF MAZELEV = 10 THEN
              TEMP := -1;
            IF (RANDOM MOD 100) > TEMP THEN
              RUNFAILD;
            FOR TEMP := 1 TO 4 DO
              BEGIN
                BATTLERC[ TEMP].A.ALIVECNT := 0;
                BATTLERC[ TEMP].A.ENMYCNT := 0
              END;
            XGOTO := XREWARD2;
            DONEFIGH := TRUE;
            EXIT( CUTIL)
          END; (* RUNAWAY *)
        
        
        PROCEDURE DOSUPRIS;  (* P010613 *)
        
          BEGIN
            CLRRECT( 13, 6, 26, 4);
            CLRRECT( 1, 11, 38, 4);
            MVCURSOR( 1, 12);
          
            IF SURPRISE = 1 THEN
              PRINTSTR( 'YOU SURPRISED THE MONSTERS!')
            ELSE
              IF SURPRISE = 2 THEN
                PRINTSTR( 'THE MONSTERS SURPRISED YOU!');
            IF SURPRISE <> 0 THEN
              BEGIN
                WRITE( CHR( 7));
                WRITE( CHR( 7));
                WRITE( CHR( 7));
                PAUSE2;
                PAUSE2
              END
          END;
          
          
        BEGIN (* CACTION *)
          DOSUPRIS;
          MYCHARX := 0;
          FILLCHAR( SPLGRCNT, 12, 0);
          WHILE MYCHARX < PARTYCNT DO
            BEGIN
              REPEAT
            
                IF (BATTLERC[ 0].A.TEMP04[ MYCHARX].STATUS = OK) AND
                   (SURPRISE <> 2) THEN
                  BEGIN
                    BATTLERC[ 0].A.TEMP04[ MYCHARX].SPELLHSH := -999;
                    REPEAT
                      AGIL1TEN := RANDOM MOD 10;
                      CASE CHARACTR[ MYCHARX].ATTRIB[ AGILITY] OF
                          3:  AGIL1TEN := AGIL1TEN + 3;
                        4,5:  AGIL1TEN := AGIL1TEN + 2;
                        6,7:  AGIL1TEN := AGIL1TEN + 1;
                         15:  AGIL1TEN := AGIL1TEN - 1;
                         16:  AGIL1TEN := AGIL1TEN - 2;
                         17:  AGIL1TEN := AGIL1TEN - 3;
                         18:  AGIL1TEN := AGIL1TEN - 4;
                      END;
                      IF AGIL1TEN < 1 THEN
                        AGIL1TEN := 1
                      ELSE
                        IF AGIL1TEN > 10 THEN
                          AGIL1TEN := 10;
                      BATTLERC[ 0].A.TEMP04[ MYCHARX].AGILITY := AGIL1TEN;
                      UNITCLEAR( 1);
                      MVCURSOR( 13, 6);
                      PRINTSTR( CHARACTR[ MYCHARX].NAME);
                      PRINTSTR( '''S OPTIONS');
                      MVCURSOR( 13, 8);
                      IF MYCHARX < 3 THEN
                        BEGIN
                          PRINTSTR( 'F)IGHT  ')
                        END;
                      PRINTSTR( 'S)PELL  P)ARRY');
                      MVCURSOR( 13, 9);
                      PRINTSTR( 'R)UN    U)SE    ');
                      BDISPELL := FALSE;
                      IF (CHARACTR[ MYCHARX].CLASS = PRIEST)
                         OR
                         ((CHARACTR[ MYCHARX].CLASS = LORD) AND 
                          (CHARACTR[ MYCHARX].CHARLEV > 8)) 
                         OR
                         ((CHARACTR[ MYCHARX].CLASS = BISHOP) AND
                          (CHARACTR[ MYCHARX].CHARLEV > 3)) THEN
                          
                          BEGIN
                            BDISPELL := TRUE;
                            PRINTSTR( 'D)ISPELL ')
                          END;
                          
                      REPEAT
                        GETKEY
                      UNTIL (INCHAR = 'F') OR (INCHAR = 'S') OR
                            (INCHAR = 'P') OR (INCHAR = 'U') OR
                            (INCHAR = 'D') OR (INCHAR = 'R') OR
                            (INCHAR = 'B');
                            
                      CLRRECT( 13, 8, 26, 2);
                      SPLGRCNT[ MYCHARX] := 0;
                          
                      CASE INCHAR OF
                      
                        'D':  IF BDISPELL THEN
                                WHICHGRP( 'DISPELL WHICH GROUP# ?', -5);
                              
                        'R':  RUNAWAY;
                        
                        'F':  IF MYCHARX < 3 THEN
                                WHICHGRP( 'FIGHT AGAINST GROUP# ?', -1);
                              
                        'P':  BEGIN
                                 BATTLERC[ 0].A.TEMP04[ MYCHARX].SPELLHSH := 0;
                                 BATTLERC[ 0].A.TEMP04[ MYCHARX].AGILITY := -1;
                              END;
                              
                        'S':  GETSPELL;
                              
                        'U':  BEGIN
                                USEITEM;
                                CLRRECT( 1, 11, 38, 4)
                              END;
                        
                        'B':  IF MYCHARX > 0 THEN
                                BATTLERC[ 0].A.TEMP04[ MYCHARX].SPELLHSH :=
                                  -100;
                      END;
                      
                    CLRRECT( 13, 6, 26, 4);
                    UNTIL BATTLERC[ 0].A.TEMP04[ MYCHARX].SPELLHSH <> -999;
                    IF BATTLERC[ 0].A.TEMP04[ MYCHARX].SPELLHSH = -100 THEN
                      MYCHARX := -1;
                  END
                ELSE
                  BATTLERC[ 0].A.TEMP04[ MYCHARX].AGILITY := -1;
                  
                MYCHARX := MYCHARX + 1
                  
              UNTIL MYCHARX = PARTYCNT;
              
              IF SURPRISE <> 2 THEN
                BEGIN
                  MVCURSOR( 14, 6);
                  PRINTSTR( 'PRESS [RETURN] TO FIGHT,');
                  MVCURSOR( 25, 7);
                  PRINTSTR( 'OR');
                  MVCURSOR( 14, 8);
                  PRINTSTR( 'GO B)ACK TO REDO OPTIONS');
                  
                  REPEAT
                    GETKEY
                  UNTIL (INCHAR = CHR( CRETURN)) OR (INCHAR = 'B');
                  
                  IF INCHAR = 'B' THEN
                    MYCHARX := 0
                END;
                CLRRECT( 13, 6, 26, 4);
                CLRRECT( 1, 11, 38, 4)
            END; (* WHILE LOOP *)
          
          FOR MYCHARX := 0 TO PARTYCNT - 1 DO
            BEGIN
              IF SPLGRCNT[ MYCHARX] > 0 THEN
                BEGIN
                  IF SPLGRCNT[ MYCHARX] > 10 THEN
                   CHARACTR[ MYCHARX].PRIESTSP[ SPLGRCNT[ MYCHARX] - 10]
                   := CHARACTR[ MYCHARX].PRIESTSP[ SPLGRCNT[ MYCHARX] - 10] - 1
                  ELSE
                   CHARACTR[ MYCHARX].MAGESP[ SPLGRCNT[ MYCHARX]]
                   := CHARACTR[ MYCHARX].MAGESP[ SPLGRCNT[ MYCHARX]] - 1
                END
            END;
        END;  (* CACTION *)
        

      PROCEDURE ENATTACK;  (* P010614 *)
      
        VAR
            UNUSEDXX : INTEGER;
            ATTCKTYP : INTEGER;
            CHARX    : INTEGER;
            ENEMYX   : INTEGER;
            GROUPI   : INTEGER;
      
      
        FUNCTION CANATTCK : BOOLEAN;  (* P010615 *)
        
          BEGIN
            CANATTCK :=
             (NOT CHARACTR[ CHARX].WEPVSTY2[ 1][ BATTLERC[ GROUPI].B.CLASS])
               OR
             ((RANDOM MOD 100) < 50)
          END;
          
          
        PROCEDURE ENEMYSPL;  (* P010616 *)
        
        
          PROCEDURE SPELLEZR( VAR SPELLGR: INTEGER);  (* P010617 *)
          
            BEGIN
              IF RANDOM MOD (BATTLERC[ GROUPI].A.ALIVECNT + 2) = 0 THEN
                SPELLGR := SPELLGR - 1
            END;
            
            
          PROCEDURE GETMAGSP( SPELLLEV: INTEGER);  (* P010618 *)
          
            VAR
                 SPELLCAS : INTEGER;
                 TWOTHIRD : BOOLEAN;
          
            BEGIN
              WHILE (SPELLLEV > 1) AND ( (RANDOM MOD 100) > 70) DO
                SPELLLEV := SPELLLEV - 1;
              TWOTHIRD := (RANDOM MOD 100) > 33;
              SPELLEZR( BATTLERC[ GROUPI].B.MAGSPELS);
              
              CASE SPELLLEV OF
              
                1:  IF TWOTHIRD THEN
                      SPELLCAS := KATINO
                    ELSE
                      SPELLCAS := HALITO;
                      
                2:  IF TWOTHIRD THEN
                      SPELLCAS := DILTO
                    ELSE
                      SPELLCAS := HALITO;  (* BUG *)
                      
                3:  IF TWOTHIRD THEN
                      SPELLCAS := MOLITO
                    ELSE
                      SPELLCAS := MAHALITO;
                      
                4:  IF TWOTHIRD THEN
                      SPELLCAS := DALTO
                    ELSE
                      SPELLCAS := LAHALITO;  (* ...HMMM *)
                      
                5:  IF TWOTHIRD THEN
                      SPELLCAS := LAHALITO   (* ...HMMM *)
                    ELSE
                      SPELLCAS := MADALTO;
                      
                6:  IF TWOTHIRD THEN
                      SPELLCAS := MADALTO    (* ...HMMM *)
                    ELSE
                      SPELLCAS := ZILWAN;
                      
                7:  SPELLCAS := TILTOWAI;
              END;
              
              ATTCKTYP := SPELLCAS
            END;  (* GETMAGSP *)
            
            
          PROCEDURE GETPRISP( SPELLLEV : INTEGER);  (* P010619 *)
          
            VAR
                 SPELLCAS : INTEGER;
                 TWOTHIRD : BOOLEAN;
                 
            BEGIN
              TWOTHIRD := (RANDOM MOD 100) > 33;
              SPELLEZR( BATTLERC[ GROUPI].B.PRISPELS);
              
              CASE SPELLLEV OF
              
                1:  SPELLCAS := BADIOS;
                
                2:  SPELLCAS := MONTINO;
                
                3:  IF TWOTHIRD THEN
                      SPELLCAS := BADIOS
                    ELSE
                      SPELLCAS := BADIAL;
                      
                4:  SPELLCAS := BADIAL;
                
                5:  IF TWOTHIRD THEN
                      SPELLCAS := BADIALMA
                    ELSE
                      SPELLCAS := BADI;
                      
                6:  IF TWOTHIRD THEN
                      SPELLCAS := LORTO
                    ELSE
                      SPELLCAS := MABADI;
                      
                7:  SPELLCAS := MABADI;
              END;
              
              ATTCKTYP := SPELLCAS
            END;  (* GETPRISP *)
            
            
          BEGIN (* ENEMYSPL *)
            IF BATTLERC[ GROUPI].B.MAGSPELS > 0 THEN
              IF (RANDOM MOD 100) < 75 THEN
                GETMAGSP( BATTLERC[ GROUPI].B.MAGSPELS);
                
            IF ATTCKTYP = 0 THEN
              IF BATTLERC[ GROUPI].B.PRISPELS > 0 THEN
                IF (RANDOM MOD 100) < 75 THEN
                  GETPRISP( BATTLERC[ GROUPI].B.PRISPELS);
          END;  (* ENEMYSPL *)
          
          
        PROCEDURE YELLHELP;  (* P01061A *)
        
          BEGIN
            IF BATTLERC[ GROUPI].B.SPPC[ 6] THEN
              IF BATTLERC[ GROUPI].A.ALIVECNT < 5 THEN
                IF (RANDOM MOD 100) < 75 THEN
                  ATTCKTYP := -4
          END;
          
          
        PROCEDURE RUNENMY;  (* P01061B *)
        
          BEGIN
            IF NOT (BATTLERC[ GROUPI].B.SPPC[ 5]) THEN
              EXIT( RUNENMY);
            IF BASE12.MYSTRENG > ENSTRENG THEN
              IF (RANDOM MOD 100) < 65 THEN
                ATTCKTYP := -2
          END;
          
          
        PROCEDURE BREATHES;  (* P01061C *)
        
          BEGIN
            IF BATTLERC[ GROUPI].B.BREATHE > 0 THEN
              IF (RANDOM MOD 100) < 60 THEN
                ATTCKTYP := -3
          END;
          
        PROCEDURE ADVANCE;  (* P01061D *)
        
          VAR
               ADVSTREN : ARRAY[ 1..4] OF INTEGER;
               ENEMYX   : INTEGER;
               GROUPI   : INTEGER;
               TEMPE2   : TENEMY2;
          
          
          PROCEDURE MOVETEXT( GROUPI : INTEGER);  (* P01061E *)
          
            (* MOVE STRINGS OF TEXT AROUND ON THE SCREEN 
               FOR THE VARIOUS MONSTER GROUP NAMES       *)
          
            TYPE
                 MEMVAR = RECORD CASE INTEGER OF
                    1:  (I: INTEGER);
                    2:  (A: ARRAY[ 0..10] OF INTEGER);
                   END;
                   
                 MEMVAR2 = RECORD CASE INTEGER OF
                    1:  (I: INTEGER);
                    2:  (P: ^INTEGER);
                   END;
                   
            VAR
                 LINEX    : INTEGER;
                 PIX      : INTEGER;
                 SAVEROW  : ARRAY[ 0..7] OF MEMVAR;
                 LINEPTRS : ARRAY[ 0..15] OF MEMVAR2;
            
            BEGIN
            
              (* SET UP POINTERS TO 2 TEXT ROWS.  EACH ROW IS 8 PIXELS. *)
            
              LINEPTRS[ 0].I :=  8192 + 128 *  GROUPI      + 16;
              LINEPTRS[ 8].I :=  8192 + 128 * (GROUPI + 1) + 16;
              FOR PIX := 1 TO 7 DO
                BEGIN
                  LINEPTRS[ PIX].I :=     LINEPTRS[ PIX - 1].I + 1024;
                  LINEPTRS[ PIX + 8].I := LINEPTRS[ PIX + 7].I + 1024
                END;
              WRITE( CHR( 7));
              
              (* SAVE UPPER ROW OF TEXT *)
              
              FOR PIX := 0 TO 7 DO
                MOVELEFT( LINEPTRS[ PIX].P^, SAVEROW[ PIX].I, 22);
                 
                (* IS 22 LARGE ENOUGH *)
                
              (* CLEAR UPPER OF THE TWO ROWS *)
                
              FOR PIX := 0 TO 7 DO
                FILLCHAR( LINEPTRS[ PIX].P^, 22, 0);
              WRITE( CHR( 7));
              
              (* MOVE LOWER ROW OF TEXT UPWARD A PIXEL AT A TIME *)
              
              FOR PIX := 7 DOWNTO 0 DO
                BEGIN
                  FOR LINEX := PIX TO PIX + 7 DO
                    MOVELEFT( LINEPTRS[ LINEX + 1].P^, LINEPTRS[ LINEX].P^, 22);
                  FILLCHAR( LINEPTRS[ PIX + 8].P^, 22, 0)
                END;
              WRITE( CHR( 7));
              
              (* MOVE SAVED ROW OF TEXT TO LOWER ROW *)
              
              FOR PIX := 0 TO 7 DO
                MOVELEFT( SAVEROW[ PIX].I, LINEPTRS[ PIX + 8].P^, 22);
            END;
            
            
          BEGIN (* ADVANCE *)
            FOR GROUPI := 1 TO 4 DO
              BEGIN
                ADVSTREN[ GROUPI] := 0;
                FOR ENEMYX := 0 TO BATTLERC[ GROUPI].A.ALIVECNT - 1 DO
                  IF BATTLERC[ GROUPI].A.TEMP04[ ENEMYX].STATUS = OK THEN
                    ADVSTREN[ GROUPI] := ADVSTREN[ GROUPI]
                                + BATTLERC[ GROUPI].A.TEMP04[ ENEMYX].HPLEFT
                                - 3 * (BATTLERC[ GROUPI].B.MAGSPELS + 
                                       BATTLERC[ GROUPI].B.PRISPELS);
                                         
                IF ADVSTREN[ GROUPI] > 1000 THEN
                  ADVSTREN[ GROUPI] := 1000
                ELSE IF ADVSTREN[ GROUPI] < 1 THEN
                  ADVSTREN[ GROUPI] := 1;
              END;
            
            FOR GROUPI := 4 DOWNTO 2 DO
              BEGIN
                IF BATTLERC[ GROUPI].A.ALIVECNT > 0 THEN
                  BEGIN
                    IF (RANDOM MOD 100) <= 
                       30 + ((20 * ADVSTREN[ GROUPI]) DIV ADVSTREN[ GROUPI - 1]) THEN
                       
                      BEGIN
                        MVCURSOR( 1, 15 - GROUPI);
                        PRINTSTR( 'THE ');
                        IF BATTLERC[ GROUPI].A.IDENTIFI THEN
                          PRINTSTR( BATTLERC[ GROUPI].B.NAMES)
                        ELSE
                          PRINTSTR( BATTLERC[ GROUPI].B.NAMEUNKS);
                        PRINTSTR( ' ADVANCE!');
                        MOVETEXT( GROUPI - 1);
                        PAUSE1;
                        
                        ENEMYX                := ADVSTREN[ GROUPI];
                        ADVSTREN[ GROUPI]     := ADVSTREN[ GROUPI - 1];
                        ADVSTREN[ GROUPI - 1] := ENEMYX;
                        
                        TEMPE2                := BATTLERC[ GROUPI];
                        BATTLERC[ GROUPI]     := BATTLERC[ GROUPI - 1];
                        BATTLERC[ GROUPI - 1] := TEMPE2
                      END;
                  END;
              END;
            CLRRECT( 1, 11, 38, 4)
          END;  (* ADVANCE *)
          
          
        BEGIN (* ENATTACK *)
          ADVANCE;
          FOR GROUPI := 1 TO 4 DO
            BEGIN
              IF BATTLERC[ GROUPI].A.ALIVECNT > 0 THEN
                FOR ENEMYX := 0 TO (BATTLERC[ GROUPI].A.ALIVECNT - 1) DO
                  WITH BATTLERC[ GROUPI] DO
                    BEGIN
                    IF (A.TEMP04[ ENEMYX].STATUS = OK) AND
                       (SURPRISE <> 1) THEN
                      BEGIN
                        A.TEMP04[ ENEMYX].AGILITY := (RANDOM MOD 8) + 2;
                        IF PARTYCNT = 1 THEN
                          CHARX := 0
                        ELSE
                          BEGIN
                            CHARX := PARTYCNT - 1;
                            WHILE BATTLERC[ 0].A.TEMP04[ CHARX].STATUS >=
                                    DEAD DO 
                              CHARX := CHARX - 1;
                            CHARX := RANDOM MOD (CHARX + 1)
                          END;
                        A.TEMP04[ ENEMYX].VICTIM := CHARX;
                        A.TEMP04[ ENEMYX].SPELLHSH := 0;
                        ATTCKTYP := 0;
                        IF CANATTCK THEN
                          BEGIN
                            ENEMYSPL;
                            IF ATTCKTYP = 0 THEN
                              BREATHES;
                            IF ATTCKTYP = 0 THEN
                              YELLHELP;
                            IF ATTCKTYP = 0 THEN
                              RUNENMY;
                            IF ATTCKTYP > 0 THEN
                              IF CHARACTR[ CHARX].WEPVSTY3[ 1][ 6] THEN
                                A.TEMP04[ ENEMYX].AGILITY := -1;
                            IF ATTCKTYP = 0 THEN
                              IF (ENEMYX <= 4 - GROUPI) OR
                                 ((60 - 10 * GROUPI) <= (RANDOM MOD 100)) THEN
                                BEGIN
                                  CHARX := CHARX MOD 3;
                                  IF CANATTCK THEN
                                    BEGIN
                                      ATTCKTYP := -1;
                                      A.TEMP04[ ENEMYX].VICTIM := CHARX
                                    END
                                  ELSE
                                    A.TEMP04[ ENEMYX].AGILITY := -1;
                                END
                          END;
                        A.TEMP04[ ENEMYX].SPELLHSH := ATTCKTYP
                      END
                    ELSE
                      A.TEMP04[ ENEMYX].AGILITY := -1
                END
            END
          END;  (* ENATTACK *)
        
        

(* ========================================================================== *)
(* DISK: Wiz1B.DSK | FILE: COMBAT3.TEXT                                *)
(* ========================================================================== *)

    PROCEDURE HEAL;  (* P01061F *)
      
        VAR
             MVUPLIVE : INTEGER;
             T1       : INTEGER; (* MULTIPLE USES *)
             T2       : INTEGER; (* MULTIPLE USES *)
             
      
        PROCEDURE TRYHEAL( HEALCHAN: INTEGER);  (* P010620 *)
        
          BEGIN
            IF HEALCHAN > 50 THEN
              HEALCHAN := 50;
            IF (RANDOM MOD 100) <= HEALCHAN THEN
              BATTLERC[ T2].A.TEMP04[ T1].STATUS := OK
          END;
          
          
        PROCEDURE HEALENMY;  (* P010621 *)
        
          VAR
               ENEMYRC : TENEMY2;
        
          BEGIN
            FOR T2 := 1 TO 4 DO
              BEGIN
                IF BATTLERC[ T2].A.ALIVECNT > 0 THEN
                  BEGIN
                    T1 := 0;
                    MVUPLIVE := 0;
                    WHILE MVUPLIVE < BATTLERC[ T2].A.ALIVECNT DO
                      BEGIN
                        BATTLERC[ T2].A.TEMP04[ T1] :=
                          BATTLERC[ T2].A.TEMP04[ MVUPLIVE];
                        MVUPLIVE := MVUPLIVE + 1;
                        IF BATTLERC[ T2].A.TEMP04[ T1].STATUS < DEAD THEN
                          BEGIN
                            CASE BATTLERC[ T2].A.TEMP04[ T1].STATUS OF
                            
                              AFRAID:
                               TRYHEAL( 10 * BATTLERC[ T2].B.HPREC.LEVEL);
                               
                              ASLEEP:
                               TRYHEAL( 20 * BATTLERC[ T2].B.HPREC.LEVEL);
                               
                              PLYZE:
                               TRYHEAL(  7 * BATTLERC[ T2].B.HPREC.LEVEL);
                            END;
                            
                            BATTLERC[ T2].A.TEMP04[ T1].HPLEFT :=
                              BATTLERC[ T2].A.TEMP04[ T1].HPLEFT +
                              BATTLERC[ T2].B.HEALPTS;
                            T1 := T1 + 1
                          END
                      END;
                    BATTLERC[ T2].A.ALIVECNT := T1
                  END
              END;
              
            FOR T1 := 1 TO 3 DO
              BEGIN
                FOR T2 := T1 + 1 TO 4 DO
                  IF (BATTLERC[ T1].A.ALIVECNT = 0) AND
                     (BATTLERC[ T2].A.ALIVECNT > 0)    THEN
                    BEGIN
                      ENEMYRC := BATTLERC[ T1];
                      BATTLERC[ T1] := BATTLERC[ T2];
                      BATTLERC[ T2] := ENEMYRC
                    END
              END;
            
            T2 := 0;
            FOR T1 := 1 TO 4 DO
              IF BATTLERC[ T1].A.ALIVECNT > 0 THEN
                T2 := T1;
            DONEFIGH := (T2 = 0)
          END;  (* HEALENMY *)
          
          
        PROCEDURE HEALPRTY;  (* P010622 *)
        
          BEGIN
            T2 := 0;
            FOR T1 := 0 TO PARTYCNT - 1 DO
              BEGIN
                IF BATTLERC[ 0].A.TEMP04[ T1].STATUS < DEAD THEN
                  BEGIN
                    IF (RANDOM MOD 4) = 2 THEN
                      BATTLERC[ 0].A.TEMP04[ T1].HPLEFT :=
                        BATTLERC[ 0].A.TEMP04[ T1].HPLEFT +
                        CHARACTR[ T1].HEALPTS -
                        CHARACTR[ T1].LOSTXYL.POISNAMT[ 1];
                      
                    IF BATTLERC[ 0].A.TEMP04[ T1].HPLEFT > 
                      CHARACTR[ T1].HPMAX THEN
                       BATTLERC[ 0].A.TEMP04[ T1].HPLEFT :=
                         CHARACTR[ T1].HPMAX;
                         
                    IF BATTLERC[ 0].A.TEMP04[ T1].HPLEFT <= 0 THEN
                      BEGIN
                        BATTLERC[ 0].A.TEMP04[ T1].STATUS := DEAD;
                        BATTLERC[ 0].A.TEMP04[ T1].HPLEFT := 0;
                        MVCURSOR( 1, 12);
                        PRINTSTR( CHARACTR[ T1].NAME);
                        PRINTSTR( ' JUST DIED!');
                        PAUSE2;
                        CLRRECT( 1, 12, 38, 1);
                      END;
           
                    CASE BATTLERC[ 0].A.TEMP04[ T1].STATUS OF
                      ASLEEP:  TRYHEAL( 10 * CHARACTR[ T1].CHARLEV);
                      AFRAID:  TRYHEAL(  5 * CHARACTR[ T1].CHARLEV);
                    END;
                  END
                END;
                
              FOR T1 := 0 TO PARTYCNT - 1 DO
                BEGIN
                  CHARACTR[ T1].HPLEFT := BATTLERC[ 0].A.TEMP04[ T1].HPLEFT;
                  CHARACTR[ T1].STATUS := BATTLERC[ 0].A.TEMP04[ T1].STATUS
                END
          END;  (* HEALPRTY *)
          
          
        PROCEDURE HEALHEAR;  (* P010623 *)
        
        
          PROCEDURE DECINAUD( GROUPI:   INTEGER;  (* P01061B *)
                              ALIVECNT: INTEGER);
          
            VAR
                 X : INTEGER;
          
            BEGIN
              FOR X := 0 TO ALIVECNT - 1 DO
                IF BATTLERC[ GROUPI].A.TEMP04[ ALIVECNT].INAUDCNT > 0 THEN
                   BATTLERC[ GROUPI].A.TEMP04[ ALIVECNT].INAUDCNT :=
                   BATTLERC[ GROUPI].A.TEMP04[ ALIVECNT].INAUDCNT - 1
            END;  (* DECINAUD *)
            
            
          BEGIN (* HEALHEAR *)
            DECINAUD( 0, PARTYCNT);
            DECINAUD( 1, BATTLERC[ 1].A.ALIVECNT);
            DECINAUD( 2, BATTLERC[ 2].A.ALIVECNT);
            DECINAUD( 3, BATTLERC[ 3].A.ALIVECNT)
          END; (* HEALHEAR *)
          
          
        BEGIN (* HEAL *)
          HEALENMY;
          HEALPRTY;
          HEALHEAR
        END;
      
      
      PROCEDURE DSPENEMY;  (* P010625 *)
      
        VAR
             ENMYGROK : INTEGER;
             ENMYGRI  : INTEGER;
             ENMYIND  : INTEGER;
      
        BEGIN
          ENSTRENG := 0;
          FOR ENMYGRI := 1 TO 4 DO
            BEGIN
              CLRRECT( 13, ENMYGRI, 26, 1);
              IF BATTLERC[ ENMYGRI].A.ALIVECNT > 0 THEN
                BEGIN
                  ENMYGROK := 0;
                  FOR ENMYIND := 0 TO BATTLERC[ ENMYGRI].A.ALIVECNT - 1 DO
                    IF BATTLERC[ ENMYGRI].A.TEMP04[ ENMYIND].STATUS = OK THEN
                      ENMYGROK := ENMYGROK + 1;
                  ENSTRENG := ENSTRENG + ENMYGROK *
                                         (BATTLERC[ ENMYGRI].B.HPREC.LEVEL);
                  MVCURSOR( 13, ENMYGRI);
                  PRINTNUM( ENMYGRI, 1);
                  PRINTSTR( ') ');
                  PRINTNUM( BATTLERC[ ENMYGRI].A.ALIVECNT, 1);
                  PRINTSTR( ' ');
                  IF BATTLERC[ ENMYGRI].A.IDENTIFI THEN
                    IF BATTLERC[ ENMYGRI].A.ALIVECNT > 1 THEN
                      PRINTSTR( BATTLERC[ ENMYGRI].B.NAMES)
                    ELSE
                      PRINTSTR( BATTLERC[ ENMYGRI].B.NAME)
                  ELSE
                    IF BATTLERC[ ENMYGRI].A.ALIVECNT > 1 THEN
                      PRINTSTR( BATTLERC[ ENMYGRI].B.NAMEUNKS)
                    ELSE
                      PRINTSTR( BATTLERC[ ENMYGRI].B.NAMEUNK);
                  PRINTSTR( ' (');
                  PRINTNUM( ENMYGROK, 1);
                  PRINTCHR( ')')
                END
            END
        END;
        
        
      PROCEDURE DSPPARTY;  (* P010626 *)
      
        VAR
             UNUSEDXX : INTEGER;
             TEMPXYZ  : INTEGER;  (* MULTIPLE USES *)
             PARTYI   : INTEGER;
             STATUSOK : BOOLEAN;
      
      
        PROCEDURE PRSTATUS;  (* P010627 *)
        
          BEGIN
            STATUSOK :=  STATUSOK OR (CHARACTR[ PARTYI].STATUS < DEAD);
            IF CHARACTR[ PARTYI].STATUS = OK THEN
              IF CHARACTR[ PARTYI].LOSTXYL.POISNAMT[ 1] > 0 THEN
                PRINTSTR( 'POISON')
              ELSE
                PRINTNUM( CHARACTR[ PARTYI].HPMAX, 4)
            ELSE
              PRINTSTR( SCNTOC.STATUS[ CHARACTR[ PARTYI].STATUS])
          END; (* PRSTATUS *)
          
          
        PROCEDURE SWAP2CHR( X: INTEGER;  (* P010628 *)
                            Y: INTEGER);
        
          VAR
               TEMPCHAR : TCHAR;
               TEMPX    : BOOLEAN;
        
          BEGIN
            TEMPCHAR := CHARACTR[ X];
            CHARACTR[ X] := CHARACTR[ Y];
            CHARACTR[ Y] := TEMPCHAR;
            
            LLBASE04 := CHARDISK[ X];
            CHARDISK[ X] := CHARDISK[ Y];
            CHARDISK[ Y] := LLBASE04;
            
            TEMPX := DRAINED[ X];
            DRAINED[ X] := DRAINED[ Y];
            DRAINED[ Y] := TEMPX;
            
            BATTLERC[ 0].A.TEMP04[ 6] := BATTLERC[ 0].A.TEMP04[ X];
            BATTLERC[ 0].A.TEMP04[ X] := BATTLERC[ 0].A.TEMP04[ Y];
            BATTLERC[ 0].A.TEMP04[ Y] := BATTLERC[ 0].A.TEMP04[ 6]
          
          END; (* SWAP2CHR *)
        
        
        BEGIN (* DSPPARTY *)
          FOR PARTYI := 0 TO PARTYCNT - 2 DO
            FOR TEMPXYZ := PARTYI + 1 TO PARTYCNT - 1 DO
              IF PREBATOR[ PARTYI] = CHARDISK[ TEMPXYZ] THEN
                SWAP2CHR( PARTYI, TEMPXYZ);
          
          FOR PARTYI := 0 TO PARTYCNT - 2 DO
            FOR TEMPXYZ := PARTYI + 1 TO PARTYCNT - 1 DO
              IF CHARACTR[ PARTYI].STATUS > CHARACTR[ TEMPXYZ].STATUS THEN
                SWAP2CHR( PARTYI, TEMPXYZ);
                
          BASE12.MYSTRENG := 0;
          BATTLERC[ 0].A.ALIVECNT := 0;
          FOR PARTYI := 0 TO PARTYCNT - 1 DO
            BEGIN
              IF CHARACTR[ PARTYI].STATUS = OK THEN
                BASE12.MYSTRENG := BASE12.MYSTRENG +
                                    CHARACTR[ PARTYI].CHARLEV;
              IF CHARACTR[ PARTYI].STATUS < DEAD THEN
                BATTLERC[ 0].A.ALIVECNT := BATTLERC[ 0].A.ALIVECNT + 1
            END;
            
          CLRRECT( 1, 17, 38, 6);
          
          STATUSOK := FALSE;
          FOR PARTYI := 0 TO PARTYCNT - 1 DO
            BEGIN
              IF (RANDOM MOD 99) < (CHARACTR[ PARTYI].ATTRIB[ IQ] +
                                    CHARACTR[ PARTYI].ATTRIB[ PIETY] +
                                    CHARACTR[ PARTYI].CHARLEV)  THEN
                BATTLERC[ (RANDOM MOD 4) + 1].A.IDENTIFI := TRUE;
              MVCURSOR( 1, 17 + PARTYI);
              PRINTNUM( PARTYI + 1, 1);
              PRINTSTR( ' ');
              PRINTSTR( CHARACTR[ PARTYI].NAME);
              MVCURSOR( 19, 17 + PARTYI);
              PRINTSTR( COPY( SCNTOC.ALIGN[ CHARACTR[ PARTYI].ALIGN], 1, 1));
              PRINTCHR( '-');
              PRINTSTR( COPY( SCNTOC.CLASS[ CHARACTR[ PARTYI].CLASS], 1, 3));
              LLBASE04 := CHARACTR[ PARTYI].ARMORCL -
                        ACMOD2 -
                        BATTLERC[ 0].A.TEMP04[ PARTYI].ARMORCL;
              IF LLBASE04 >= 0 THEN
                PRINTNUM( LLBASE04, 3)
              ELSE
                IF LLBASE04 > - 10 THEN
                  BEGIN
                    PRINTSTR( ' -');
                    PRINTNUM( ABS( LLBASE04), 1)
                  END
                ELSE
                  PRINTSTR( ' LO');
              PRINTNUM( CHARACTR[ PARTYI].HPLEFT, 5);
              TEMPXYZ := CHARACTR[ PARTYI].HEALPTS -
                         CHARACTR[ PARTYI].LOSTXYL.POISNAMT[ 1];
              IF TEMPXYZ = 0 THEN
                PRINTCHR( ' ')
              ELSE IF TEMPXYZ < 0 THEN
                PRINTCHR( '-')
              ELSE
                PRINTCHR( '+');
              PRSTATUS;
            END;
          IF NOT STATUSOK THEN
            EXIT( COMBAT);
        END; (* DSPPARTY *)
        
        
      BEGIN (* CUTIL *)
        HEAL;
        DSPPARTY;
        DSPENEMY;
        IF DONEFIGH THEN
          EXIT( CUTIL);
        ENATTACK;
        CACTION;
        SURPRISE := 0
      END;  (* CUTIL *)
  

(* ========================================================================== *)
(* DISK: Wiz1B.DSK | FILE: COMBAT4.TEXT                                *)
(* ========================================================================== *)

(* MELEE *)

SEGMENT PROCEDURE MELEE;  (* P010701 *)

  VAR
         VICTIM   : INTEGER;
         ATTACKTY : INTEGER;
         BATI     : INTEGER;
         BATG     : INTEGER;
         AGILELEV : INTEGER;
  
(* CASTASPE *)

    SEGMENT PROCEDURE CASTASPE;  (* P010801 *)
    
      TYPE
           THITHEAL = RECORD
               HITS     : INTEGER;
               HITRANGE : INTEGER;
               HITMIN   : INTEGER;
             END;
                    
      VAR
           SPELL    : INTEGER;
           CASTI    : INTEGER;
           CASTGR   : INTEGER;
           
           
      PROCEDURE DSPNAMES( GROUPI:  INTEGER;  (* P010802 *)
                          MYCHARI: INTEGER);
      
        BEGIN
          IF GROUPI = 0 THEN
            PRINTSTR( CHARACTR[ MYCHARI].NAME)
          ELSE
            IF BATTLERC[ GROUPI].A.IDENTIFI THEN
              PRINTSTR( BATTLERC[ GROUPI].B.NAME)
            ELSE
              PRINTSTR( BATTLERC[ GROUPI].B.NAMEUNK);
          PRINTSTR( ' ');
        END;
        
        
      PROCEDURE UNAFFECT( GROUPI: INTEGER;
                          CHARX:  INTEGER;
                          DAMPTS: INTEGER);  (* P010803 *)
      
        BEGIN
          CLRRECT( 1, 12, 38, 3);
          IF BATTLERC[ GROUPI].A.TEMP04[ CHARX].STATUS >= DEAD THEN
            EXIT( UNAFFECT);
          MVCURSOR( 1, 12);
          DSPNAMES( GROUPI, CHARX);
          IF GROUPI <> 0 THEN
            BEGIN
              IF BATTLERC[ GROUPI].B.UNAFFCT > (RANDOM MOD 100) THEN
                 DAMPTS := 0;
            END;
          IF DAMPTS = 0 THEN
            PRINTSTR( 'IS UNAFFECTED!')
          ELSE
            BEGIN
              PRINTSTR( 'TAKES ');
              PRINTNUM( DAMPTS, 4);
              PRINTSTR( ' DAMAGE');
              WITH BATTLERC[ GROUPI].A.TEMP04[ CHARX] DO
                BEGIN
                  HPLEFT := HPLEFT - DAMPTS;
                  IF HPLEFT <= 0 THEN
                    BEGIN
                      HPLEFT := 0;
                      STATUS := DEAD;
                      MVCURSOR( 1, 14);
                      DSPNAMES( GROUPI, CHARX);
                      PRINTSTR( 'DIES!')
                    END
                END
            END;
          PAUSE1
        END;
        
        
      PROCEDURE ISISNOT( GROUPI:    INTEGER;  (* P010804 *)
                         CHARI:     INTEGER;
                         ISNOTCHN:  INTEGER;
                         SDAMTYPE:  STRING;
                         DAMTYPE:   INTEGER);
      
        BEGIN
          MVCURSOR( 1, 13);
          DSPNAMES( GROUPI, CHARI);
          
          IF (RANDOM MOD 100) < ISNOTCHN THEN
            PRINTSTR( 'IS NOT ')
          ELSE
            BEGIN
              PRINTSTR( 'IS ');
              CASE DAMTYPE OF
              
                0, 3:  BATTLERC[ GROUPI].A.TEMP04[ CHARI].STATUS := ASLEEP;
                
                   1:  BATTLERC[ GROUPI].A.TEMP04[ CHARI].INAUDCNT :=
                         (RANDOM MOD 4) + 2;
                         
                   2:  BEGIN
                         BATTLERC[ GROUPI].A.TEMP04[ CHARI].STATUS := DEAD;
                         BATTLERC[ GROUPI].A.TEMP04[ CHARI].HPLEFT := 0
                       END
              END
            END;
          PRINTSTR( SDAMTYPE);
          PAUSE1;
          CLRRECT( 1, 13, 38, 1)
        END;
        
        
      FUNCTION CALCPTS( HITHEAL: THITHEAL) : INTEGER;  (* P010805 *)
      
        VAR
             POINTS : INTEGER;
             
        BEGIN
          POINTS := 0;
          WHILE HITHEAL.HITS > 0 DO
            BEGIN
              POINTS := POINTS + (RANDOM MOD HITHEAL.HITRANGE) + 1;
              HITHEAL.HITS := HITHEAL.HITS - 1
            END;
          CALCPTS := POINTS + HITHEAL.HITMIN
        END;
        
        
      PROCEDURE MODAC( GROUPI: INTEGER;  (* P010806 *)
                       ACMOD:  INTEGER;
                       CHARF:  INTEGER;
                       CHARL:  INTEGER);
                         
        VAR
             X : INTEGER;
      
        BEGIN
          FOR X := CHARF TO CHARL DO
            BATTLERC[ GROUPI].A.TEMP04[ X].ARMORCL :=
              BATTLERC[ GROUPI].A.TEMP04[ X].ARMORCL + ACMOD;
        END;
        
        
      PROCEDURE DOHEAL( GROUPI:   INTEGER;   (* P010807 *)
                        CHARI:    INTEGER;
                        HITCNT:   INTEGER;
                        HITRANGE: INTEGER);
      
        VAR
             HITHEAL : THITHEAL;
             POINTS  : INTEGER;
      
        BEGIN
          HITHEAL.HITS     := HITCNT;
          HITHEAL.HITRANGE := HITRANGE;
          HITHEAL.HITMIN   := 0;
          POINTS := CALCPTS( HITHEAL);
          BATTLERC[ GROUPI].A.TEMP04[ CHARI].HPLEFT :=
            BATTLERC[ GROUPI].A.TEMP04[ CHARI].HPLEFT + POINTS;
          IF CHARACTR[ CHARI].HPMAX < 
               BATTLERC[ GROUPI].A.TEMP04[ CHARI].HPLEFT THEN
            BATTLERC[ GROUPI].A.TEMP04[ CHARI].HPLEFT :=
              CHARACTR[ CHARI].HPMAX;
          DSPNAMES( GROUPI, CHARI);
          IF CHARACTR[ CHARI].HPMAX =
               BATTLERC[ GROUPI].A.TEMP04[ CHARI].HPLEFT THEN
            PRINTSTR( 'IS FULLY HEALED')
          ELSE
            PRINTSTR( 'IS PARTIALLY HEALED')
        END;
        
        
      PROCEDURE DOHITS( GROUPI:   INTEGER;  (* P010808 *)
                        CHARI:    INTEGER;
                        HITCNT:   INTEGER;
                        HITRANGE: INTEGER);
      
        VAR
            HITHEAL : THITHEAL;
            POINTS  : INTEGER;
      
        BEGIN
          HITHEAL.HITS     := HITCNT;
          HITHEAL.HITRANGE := HITRANGE;
          HITHEAL.HITMIN   := 0;
          POINTS := CALCPTS( HITHEAL);
          IF GROUPI > 0 THEN
            IF BATTLERC[ GROUPI].B.UNAFFCT > 0 THEN
              IF (RANDOM MOD 100) < BATTLERC[ GROUPI].B.UNAFFCT THEN
                POINTS := 0;
          UNAFFECT( GROUPI, CHARI, POINTS)
        END;
        
        
      PROCEDURE DOHOLD;  (* P010809 *)
      
        VAR
            CHARX : INTEGER;
            
        BEGIN
          FOR CHARX := 0 TO BATTLERC[ CASTGR].A.ALIVECNT - 1 DO
            IF BATTLERC[ CASTGR].A.TEMP04[ CHARX].STATUS <= ASLEEP THEN
              IF CASTGR = 0 THEN
                ISISNOT( CASTGR,
                         CHARX,
                         50 + 10 * CHARACTR[ CHARX].CHARLEV,
                         'HELD',
                         0)
              ELSE
                ISISNOT( CASTGR,
                         CHARX,
                         50 + 10 * BATTLERC[ CASTGR].B.HPREC.LEVEL,
                         'HELD',
                         0)
                 
        END;
        
        
      PROCEDURE DOSILENC;  (* P01080A *)
      
        VAR
             CHARX : INTEGER;
      
        BEGIN
          FOR CHARX := 0 TO BATTLERC[ CASTGR].A.ALIVECNT - 1 DO
            IF CASTGR = 0 THEN
              ISISNOT( CASTGR,
                       CHARX,
                        100 - 5 * CHARACTR[ CHARX].LUCKSKIL[ 4],
                       'SILENCED',
                       1)
            ELSE
              ISISNOT( CASTGR,
                       CHARX,
                       10 * BATTLERC[ CASTGR].B.HPREC.LEVEL, 
                       'SILENCED',
                       1)
        END;
        
        
      PROCEDURE DODISRUP;  (* P01080B *)
      
        BEGIN
          MVCURSOR( 1, 13);
          PRINTSTR( 'SPELL DISRUPTED')
        END;
        
        
      PROCEDURE DOSLAIN( GROUPI: INTEGER;  (* P01080C *)
                         CHARI:  INTEGER);
      
        VAR
             CHNOTSLN : INTEGER;
      
        BEGIN
          IF GROUPI = 0 THEN
            CHNOTSLN := CHARACTR[ CHARI].CHARLEV
          ELSE
            CHNOTSLN := BATTLERC[ GROUPI].B.HPREC.LEVEL;
          ISISNOT( GROUPI, CHARI, 10 * CHNOTSLN, 'SLAIN', 2)
        END;
        
        
      PROCEDURE DOSLEPT;  (* P01080D *)
      
        VAR
             CHARX : INTEGER;
      
        BEGIN
          FOR CHARX := 0 TO BATTLERC[ CASTGR].A.ALIVECNT - 1 DO
            IF BATTLERC[ CASTGR].A.TEMP04[ CHARX].STATUS < ASLEEP THEN
              IF CASTGR > 0 THEN
                BEGIN
                IF BATTLERC[ CASTGR].B.SPPC[ 4] THEN
                  ISISNOT( CASTGR,
                           CHARX,
                           20 * BATTLERC[ CASTGR].B.HPREC.LEVEL,
                           'SLEPT',
                           3)
                END
              ELSE
                ISISNOT( CASTGR,
                         CHARX,
                         20 * CHARACTR[ CHARX].CHARLEV,
                         'SLEPT',
                         3)
        END;
        
        
      PROCEDURE HAMMAHAM( MAHAMFLG: INTEGER);  (* P01080E *)
      
        VAR
             TEMP2    : INTEGER;  (* MULTIPLE USES *)
             TEMP1    : INTEGER;  (* MULTIPLE USES *)
      
      
        PROCEDURE HAMCURE;  (* P01080F *)
        
          VAR
               HITHEAL : THITHEAL;
        
          BEGIN
            PRINTSTR( 'DIALKO''S PARTY 3 TIMES');
            HITHEAL.HITS := 9;
            HITHEAL.HITRANGE := 8;
            HITHEAL.HITMIN := 0;
            FOR TEMP1 := 0 TO PARTYCNT - 1 DO
              IF BATTLERC[ 0].A.TEMP04[ TEMP1].STATUS < DEAD THEN
                BEGIN
                  WITH  BATTLERC[ 0].A.TEMP04[ TEMP1] DO
                    BEGIN
                      STATUS := OK;
                      INAUDCNT := 0;
                      HPLEFT := HPLEFT + CALCPTS( HITHEAL);
                      IF HPLEFT > CHARACTR[ TEMP1].HPMAX THEN
                        HPLEFT := CHARACTR[ TEMP1].HPMAX;
                    END
                END
          END;
          
          
        PROCEDURE HAMSILEN;  (* P010810 *)
        
          BEGIN
            PRINTSTR( 'SILENCES MONSTERS!');
            FOR TEMP1 := 1 TO 3 DO
              FOR TEMP2 := 0 TO BATTLERC[ TEMP1].A.ALIVECNT - 1 DO
                BATTLERC[ TEMP1].A.TEMP04[ TEMP2].INAUDCNT :=
                  5 + (RANDOM MOD 5)
          END;
          
          
        PROCEDURE HAMMAGIC;  (* P010811 *)
        
          BEGIN
            PRINTSTR( 'ZAPS MONSTER MAGIC RESISTANCE!');
            FOR TEMP1 := 1 TO 3 DO
              BEGIN
                BATTLERC[ TEMP1].B.UNAFFCT := 0
              END
          END;
          
          
        PROCEDURE HAMTELEP;  (* P010812 *)    (* NAME IS FROM MESSAGE *)
        
          BEGIN
            PRINTSTR( 'DESTROYS MONSTERS!');
            FOR TEMP1 := 1 TO 4 DO
              BEGIN
                FOR TEMP2 := 0 TO BATTLERC[ TEMP1].A.ALIVECNT - 1 DO
                  BEGIN
                    BATTLERC[ TEMP1].A.TEMP04[ TEMP2].STATUS := DEAD;
                    BATTLERC[ TEMP1].A.TEMP04[ TEMP2].HPLEFT := 0
                  END;
                BATTLERC[ TEMP1].A.ALIVECNT := 0
              END
          END;
          
          
        PROCEDURE HAMHEAL;  (* P010813 *)
        
          BEGIN
            PRINTSTR( 'HEALS PARTY!');
            FOR TEMP1 := 0 TO PARTYCNT - 1 DO
              IF BATTLERC[ 0].A.TEMP04[ TEMP1].STATUS < DEAD THEN
                BEGIN
                  WITH BATTLERC[ 0].A.TEMP04[ TEMP1] DO
                    BEGIN
                      STATUS := OK;
                      INAUDCNT := 0;
                      HPLEFT := CHARACTR[ TEMP1].HPMAX
                    END;
                END
          END;
          
          
        PROCEDURE HAMPROT; (* P010814 *)
        
          BEGIN
            PRINTSTR( 'SHIELDS PARTY');
            FOR TEMP1 := 0 TO PARTYCNT - 1 DO
              IF CHARACTR[ TEMP1].ARMORCL > -10 THEN
                CHARACTR[ TEMP1].ARMORCL := -10
          END;
          
          
        PROCEDURE HAMALIVE;  (* P010815 *)
        
          BEGIN
            PRINTSTR( 'RESSURECTS AND ');
            FOR TEMP1 := 0 TO PARTYCNT - 1 DO
              IF BATTLERC[ 0].A.TEMP04[ TEMP1].STATUS <> LOST THEN
                BATTLERC[ 0].A.TEMP04[ TEMP1].STATUS := OK;
            HAMHEAL
          END;
      
      
        PROCEDURE HAMMANGL;  (* P010816 *)
        
          VAR
               SPELLI : INTEGER;
              
          BEGIN (* HAMMANGL *)
            MVCURSOR( 1, 14);
            PRINTSTR( 'BUT HIS SPELL BOOKS ARE MANGLED!');
            FOR SPELLI := 1 TO 50 DO
              BEGIN
                IF (RANDOM MOD 100) > 50 THEN
                  CHARACTR[ TEMP1].SPELLSKN[ SPELLI] := FALSE
              END
          END; (* HAMMANGL *)
      
      
        BEGIN  (* HAMMAHAM *)
          IF MAHAMFLG = 7 THEN
            PRINTSTR( 'MA');
          PRINTSTR( 'HAMAN IS INTONED AND...');
          PAUSE2;
          MVCURSOR( 1, 13);
          IF CHARACTR[ BATI].CHARLEV < 13 THEN
            BEGIN
              PRINTSTR( 'FAILS!');
              EXIT( HAMMAHAM)
            END;
          CHARACTR[ BATI].CHARLEV := CHARACTR[ BATI].CHARLEV - 1;
          DRAINED[ BATI] := TRUE;
          
          CASE RANDOM MOD 3 * MAHAMFLG OF     (* MAHAMFLG IS 6 OR 7 *)
             0,  1,  2,  3,  4,  5:  HAMCURE;   (*     1? 2? 3? 4? 5? *)
                 7,  8,  9, 10, 11:  HAMSILEN;  (*     8? 9? 10? 11?  *)
                    12, 13, 22, 23:  HAMMAGIC;  (*    13?, 22?, 23?   *)
                        14, 20, 21:  HAMTELEP;  (*    14?, 20?        *)
                         6, 15, 19:  HAMHEAL;   (*    15?, 19?        *)
                                17:  HAMPROT;   (*    17?      DEAD CODE    *)
                            16, 18:  HAMALIVE;  (*    16?, 18? DEAD CODE    *)
                            
          (* MAYBE THEY WANTED "RANDOM MOD (3 * MAHAMFLG)",
             AND MAHAMFLG = 6 OR 8 DEPENDING ON SPELL *)
                            
                            
          END;
          IF (RANDOM MOD CHARACTR[ BATI].CHARLEV) = 5 THEN
            HAMMANGL
        END;   (* HAMMAHAM *)
        
        
      PROCEDURE HITGROUP( GROUPI:  INTEGER;  (* P010817 *)
                          HITSX:   INTEGER;
                          HITSR:   INTEGER;
                          TEMP99I: INTEGER);
      
        VAR
             CHARI : INTEGER;
      
        BEGIN
          IF BATTLERC[ GROUPI].A.ALIVECNT > 0 THEN
            FOR CHARI := 0 TO BATTLERC[ GROUPI].A.ALIVECNT - 1 DO
              BEGIN
                IF GROUPI = 0 THEN
                  BATTLERC[ 0].B.WEPVSTY3 := CHARACTR[ CHARI].WEPVSTY3[ 1];
                IF BATTLERC[ GROUPI].B.WEPVSTY3[ TEMP99I] THEN
                  DOHITS( GROUPI, CHARI, HITSX DIV 2 + 1, HITSR)
                ELSE
                  DOHITS( GROUPI, CHARI, HITSX, HITSR)
              END
        END;
        
        
      PROCEDURE SLOKTOFE;  (* P010818 *)
      
        VAR
             POSSX :  INTEGER;
             TEMPXX : INTEGER; (* MULTIPLE USES *)
      
        BEGIN
          IF (RANDOM MOD 100) >  2 * CHARACTR[ BATI].CHARLEV THEN
            BEGIN
              MVCURSOR( 1, 13);
              PRINTSTR( 'LOKTOFEIT FAILS!');
              EXIT( SLOKTOFE)
            END;
          FOR TEMPXX := 0 TO PARTYCNT - 1 DO
            BEGIN
              FOR POSSX := 1 TO CHARACTR[ TEMPXX].POSS.POSSCNT DO
                WITH CHARACTR[ TEMPXX].POSS.POSSESS[ POSSX] DO
                  BEGIN
                    EQINDEX := 0;
                    IDENTIF := FALSE;
                    CURSED  := FALSE;
                    EQUIPED := FALSE
                  END;
              CHARACTR[ TEMPXX].POSS.POSSCNT := 0;
              CHARACTR[ TEMPXX].GOLD.HIGH := 0;
              CHARACTR[ TEMPXX].GOLD.MID  := 0
            END;
          XGOTO := XCHK4WIN;
          WRITE( CHR( 12));
          TEXTMODE;
          EXIT( COMBAT)(* EXITCOMB *)
        END;
        
        
      PROCEDURE SMAKANIT;  (* P010819 *)
        
        VAR
             ENEMYX  : INTEGER;
             GROUPI  : INTEGER;
             
          
        BEGIN (* SMAKANIT *)
          FOR GROUPI := 1 TO 4 DO
            BEGIN
              IF BATTLERC[ GROUPI].A.ALIVECNT > 0 THEN
                BEGIN
                  MVCURSOR( 1, 13);
                  IF BATTLERC[ GROUPI].A.IDENTIFI THEN
                    PRINTSTR( BATTLERC[ GROUPI].B.NAMES)
                  ELSE
                    PRINTSTR(BATTLERC[ GROUPI].B.NAMEUNKS);
                              
                  IF BATTLERC[ GROUPI].B.CLASS = 10 THEN
                    PRINTSTR( ' ARE UNAFFECTED!')
                  ELSE
                    IF BATTLERC[ GROUPI].B.HPREC.LEVEL > 7 THEN
                      PRINTSTR( ' SURVIVE!')
                    ELSE
                      BEGIN
                        PRINTSTR( ' PERISH!');
                        FOR ENEMYX := 0 TO BATTLERC[ GROUPI].A.ALIVECNT DO
                          BEGIN
                            WITH BATTLERC[ GROUPI].A.TEMP04[ ENEMYX] DO
                              BEGIN
                                HPLEFT := 0;
                                STATUS := DEAD
                              END
                          END
                      END;
                  PAUSE1;
                  CLRRECT( 1, 13, 38, 1)
                END
            END
        END;  (* SMAKANIT *)
        
        
      PROCEDURE SMALOR;  (* P01081A *)
      
        VAR
             UNUSEDXX : INTEGER;
             UNUSEDYY : INTEGER;
             
        BEGIN
          MAZEX := RANDOM MOD 20;
          MAZEY := RANDOM MOD 20;
          WHILE (RANDOM MOD 100) < 30 DO
            MAZELEV := MAZELEV - 1;
          WHILE (RANDOM MOD 100) < 10 DO
            MAZELEV := MAZELEV - 1;
          IF MAZELEV < SCNTOC.RECPERDK[ ZMAZE] THEN
            MAZELEV := SCNTOC.RECPERDK[ ZMAZE];
          CLRRECT( 13, 1, 26, 4);
          IF MAZELEV = 0 THEN
            BEGIN
              XGOTO := XCHK4WIN;
              WRITE( CHR(12));
              TEXTMODE
            END
          ELSE
            XGOTO := XNEWMAZE;
          EXIT( COMBAT)
        END;
        
        
      PROCEDURE DOPRIEST;  (* P01081B *)
      
        VAR
             GROUPI : INTEGER;
      
        BEGIN
          IF SPELL = KALKI THEN
            MODAC( 0, 1, 0, PARTYCNT - 1);
          IF SPELL = DIOS THEN
            DOHEAL( 0, CASTGR, 1, 8);
          IF SPELL = BADIOS THEN
            DOHITS( CASTGR, CASTI, 1, 8);
          IF SPELL = MILWA THEN
            LIGHT := LIGHT + 15 + (RANDOM MOD 15);
          IF SPELL = PORFIC THEN
            MODAC( 0, 4, BATI, BATI);
          IF SPELL = MATU THEN
            MODAC( 0, 2, 0, PARTYCNT - 1);
          IF SPELL = MANIFO THEN
            DOHOLD;
          IF SPELL = MONTINO THEN
            DOSILENC;
          IF SPELL = LOMILWA THEN
            LIGHT := 32000;
          IF SPELL = DIALKO THEN
            BEGIN
              DSPNAMES( 0, CASTGR);
              IF (BATTLERC[ 0].A.TEMP04[ CASTGR].STATUS = PLYZE) OR
                 (BATTLERC[ 0].A.TEMP04[ CASTGR].STATUS = ASLEEP) THEN
                BEGIN
                  BATTLERC[ 0].A.TEMP04[ CASTGR].STATUS := OK;
                  PRINTSTR( 'IS CURED!')
                END
              ELSE
                PRINTSTR( 'IS NOT HELPED!');
            END;
          IF SPELL = LATUMAPI THEN
            BEGIN
              FOR GROUPI := 1 TO 4 DO
                BATTLERC[ LLBASE04].A.IDENTIFI := TRUE;  (* BUG? WITH BASE04*)
            END;
          IF SPELL = BAMATU THEN
            MODAC( 0, 4, 0, PARTYCNT - 1);
          IF SPELL = DIAL THEN
            DOHEAL( 0, CASTGR, 2, 8);
          IF SPELL = BADIAL THEN
            DOHITS( CASTGR, CASTI, 2, 8);
          IF SPELL = LATUMOFI THEN
            BEGIN
              DSPNAMES( 0, CASTGR);
              PRINTSTR( 'IS UNPOISONED!');
              CHARACTR[ CASTGR].LOSTXYL.POISNAMT[ 1] := 0
            END;
          IF SPELL = MAPORFIC THEN
            ACMOD2 := 2;
          IF SPELL = DIALMA THEN
            DOHEAL( 0, CASTGR, 3, 8);
          IF SPELL = BADIALMA THEN
            DOHITS( CASTGR, CASTI, 3, 8);
          IF SPELL = LITOKAN THEN
            HITGROUP( CASTGR, 3, 8, 1);
          IF SPELL = KANDI THEN
            DODISRUP;
          IF SPELL = DI THEN
            DODISRUP;
          IF SPELL = BADI THEN
            DOSLAIN( CASTGR, CASTI);
          IF SPELL = LORTO THEN
            HITGROUP( CASTGR, 6, 6, 0);
          IF SPELL = MADI THEN
            BEGIN
              BATTLERC[ 0].A.TEMP04[ CASTGR].HPLEFT :=
                CHARACTR[ CASTGR].HPMAX;
              IF BATTLERC[ 0].A.TEMP04[ CASTGR].STATUS < DEAD THEN
                BATTLERC[ 0].A.TEMP04[ CASTGR].STATUS := OK;
              CHARACTR[ CASTGR].LOSTXYL.POISNAMT[ 1] := 0;
              DOHEAL( 0, CASTGR, 1, 1)
            END;
          IF SPELL = MABADI THEN
            BEGIN
              CLRRECT( 1, 12, 38, 3);
              MVCURSOR( 1, 12);
              DSPNAMES( CASTGR, CASTI);
              PRINTSTR( ' IS HIT BY MABADI!');
               BATTLERC[ CASTGR].A.TEMP04[ CASTI].HPLEFT := 
                 1 + (RANDOM MOD 8);
            END;
          IF SPELL = LOKTOFEI THEN
            SLOKTOFE;
          IF SPELL = MALIKTO THEN
            FOR GROUPI := 1 TO 4 DO
              HITGROUP( GROUPI, 12, 6, 0);
          IF SPELL = KADORTO THEN
            DODISRUP
        END;
        
        
      PROCEDURE DOMAGE;  (* P01081C *)
      
        VAR
             GROUPI : INTEGER;  (* MULTIPLE USES *)
      
        BEGIN
          IF SPELL = HALITO THEN
            DOHITS( CASTGR, CASTI, 1, 8);
          IF SPELL = MOGREF THEN
            MODAC( 0, 2, BATI, BATI);
          IF SPELL = KATINO THEN
            DOSLEPT;
          IF SPELL = DILTO THEN
            MODAC( CASTGR, -2, 0, BATTLERC[ CASTGR].A.ALIVECNT - 1);
          IF SPELL = SOPIC THEN
            MODAC( 0, 4, BATI, BATI);
          IF SPELL = MAHALITO THEN
            HITGROUP( CASTGR, 4, 6, 1);
          IF SPELL = MOLITO THEN
            HITGROUP( CASTGR, 3, 6, 0);
          IF SPELL = MORLIS THEN
            MODAC( CASTGR, -3, 0, BATTLERC[ CASTGR].A.ALIVECNT - 1);
          IF SPELL = DALTO THEN
            HITGROUP( CASTGR, 6, 6, 2);
          IF SPELL = LAHALITO THEN
            HITGROUP( CASTGR, 6, 6, 1);
          IF SPELL = MAMORLIS THEN
            FOR GROUPI := 1 TO 4 DO
              MODAC( GROUPI, -3, 1, BATTLERC[ GROUPI].A.ALIVECNT);
          IF SPELL = MAKANITO THEN
            SMAKANIT;
          IF SPELL = MADALTO THEN
            HITGROUP( CASTGR, 8, 8, 2);
          IF SPELL = LAKANITO THEN
            FOR GROUPI := 0 TO BATTLERC[ CASTGR].A.ALIVECNT - 1 DO
              IF BATTLERC[ CASTGR].A.TEMP04[ GROUPI].STATUS < DEAD THEN
                ISISNOT( CASTGR, GROUPI, 6 * BATTLERC[ CASTGR].B.HPREC.LEVEL,
                         'SMOTHERED', 2);
          IF SPELL = ZILWAN THEN
            IF BATTLERC[ CASTGR].B.CLASS = 10 THEN
              DOHITS( CASTGR, CASTI, 10, 200);
          IF SPELL = MASOPIC THEN
            MODAC( 0, 4, 0, PARTYCNT - 1);
          IF SPELL = HAMAN THEN
            HAMMAHAM( 6);
          IF SPELL = MALOR THEN
            SMALOR;
          IF SPELL = MAHAMAN THEN
            HAMMAHAM( 7);
          IF SPELL = TILTOWAIT THEN
            IF BATG = 0 THEN
              FOR GROUPI := 1 TO 4 DO
                HITGROUP( GROUPI, 10, 15, 0)
            ELSE
              HITGROUP( 0, 10, 15, 0)
        END;
        
        
      PROCEDURE EXITCAST( EXITSTR: STRING);  (* P01081D *)
      
        BEGIN
          MVCURSOR( 1, 12);
          PRINTSTR( EXITSTR);
          EXIT( CASTASPE)
        END;
        
        
      BEGIN  (* CASTASPE P010801 *)
        DSPNAMES( BATG, BATI);
        PRINTSTR( 'CASTS A SPELL');
        IF BATTLERC[ BATG].A.TEMP04[ BATI].INAUDCNT > 0 THEN
          EXITCAST( 'WHICH FAILS TO BECOME AUDIBLE!');
        IF FIZZLES > 0 THEN
          EXITCAST( 'WHICH FIZZLES OUT');
        IF BATG = 0 THEN
          BEGIN
            CASTGR := BATTLERC[ 0].A.TEMP04[ BATI].VICTIM;
            IF (CASTGR > 0) AND (CASTGR < 5) THEN
              IF BATTLERC[ CASTGR].A.ALIVECNT > 0 THEN
                CASTI := BATI MOD BATTLERC[ CASTGR].A.ALIVECNT;
            SPELL := BATTLERC[ 0].A.TEMP04[ BATI].SPELLHSH;
          END
        ELSE
          BEGIN
            CASTGR := 0;
            CASTI  := BATTLERC[ BATG].A.TEMP04[ BATI].VICTIM;
            SPELL  := BATTLERC[ BATG].A.TEMP04[ BATI].SPELLHSH
          END;
        MVCURSOR( 1, 12);
        DOMAGE;
        DOPRIEST
      END;   (* CASTASPE P010801 *)
    

(* ========================================================================== *)
(* DISK: Wiz1B.DSK | FILE: COMBAT5.TEXT                                *)
(* ========================================================================== *)


SEGMENT PROCEDURE SWINGASW;  (* P010901 *)
    
    
    PROCEDURE ARMATTK;  (* P010902 *)
      
        BEGIN
          CASE (RANDOM MOD 5) OF
            0:  PRINTSTR( 'SWINGS');
            1:  PRINTSTR( 'THRUSTS');
            2:  PRINTSTR( 'STABS');
            3:  PRINTSTR( 'SLASHES');
            4:  PRINTSTR( 'CHOPS')
          END
        END;
      
      
    PROCEDURE PRNAME( GROUPI: INTEGER;  (* P010903 *)
                      CHARX:  INTEGER);
                     
      BEGIN
        IF GROUPI = 0 THEN
          PRINTSTR(  CHARACTR[ CHARX].NAME)
        ELSE IF BATTLERC[ GROUPI].A.IDENTIFI THEN
          PRINTSTR(  BATTLERC[ GROUPI].B.NAME)
        ELSE
          PRINTSTR( BATTLERC[ GROUPI].B.NAMEUNK);
        PRINTSTR( ' ')
      END;
        

      PROCEDURE UNAFFECT( GROUPI: INTEGER;
                          CHARI:  INTEGER;
                          HITDAM: INTEGER);  (* P010904 *)
      
        (* COMBINATION OF UNAFFECT AND BREATHDM IN LOL *)
      
        BEGIN
          CLRRECT( 1, 12, 38, 3);
          IF BATTLERC[ GROUPI].A.TEMP04[ CHARI].STATUS >= DEAD THEN
            EXIT( UNAFFECT);
          MVCURSOR( 1, 12);
          PRNAME( GROUPI, CHARI);
          IF GROUPI <> 0 THEN
            BEGIN
              IF BATTLERC[ GROUPI].B.UNAFFCT > (RANDOM MOD 100) THEN
                 HITDAM := 0;
            END;
          IF HITDAM = 0 THEN
            PRINTSTR( 'IS UNAFFECTED!')
          ELSE
            BEGIN
              PRINTSTR( 'TAKES ');
              PRINTNUM( HITDAM, 4);
              PRINTSTR( ' DAMAGE');
              WITH BATTLERC[ GROUPI].A.TEMP04[ CHARI] DO
                BEGIN
                  HPLEFT := HPLEFT - HITDAM;
                  IF HPLEFT <= 0 THEN
                    BEGIN
                      HPLEFT := 0;
                      STATUS := DEAD;
                      MVCURSOR( 1, 14);
                      PRNAME( GROUPI, CHARI);
                      PRINTSTR( 'IS SLAIN!');
                    END
                END
            END;
          PAUSE1
        END;
        
        
      FUNCTION CALCHP( AHPREC: THPREC) : INTEGER;  (* P010905 *)
                           
        VAR
             HITPTS : INTEGER;
             
        BEGIN
          HITPTS := 0;
          WHILE AHPREC.LEVEL > 0 DO
            BEGIN
              HITPTS := HITPTS + (RANDOM MOD AHPREC.HPFAC) + 1;
              AHPREC.LEVEL := AHPREC.LEVEL - 1
            END;
          CALCHP := HITPTS + AHPREC.HPMINAD
        END;
        
        
      PROCEDURE DOBREATH;  (* P010906 *)
      
        VAR
             UNUSED : INTEGER;
             HITDAM : INTEGER;
             CHARX  : INTEGER;
      
        BEGIN
          PRINTSTR(  'BREATHES!');
          FOR CHARX := 0 TO PARTYCNT - 1 DO
            BEGIN
              IF BATTLERC[ 0].A.TEMP04[ CHARX].STATUS < DEAD THEN
                BEGIN
                  CLRRECT( 1, 12, 38, 3);
                  MVCURSOR( 1, 12);
                  HITDAM := BATTLERC[ BATG].A.TEMP04[ BATI].HPLEFT DIV 2;
                  IF (RANDOM MOD 20) >= CHARACTR[ CHARX].LUCKSKIL[ 3] THEN
                    HITDAM := (HITDAM + 1) DIV 2;
                  IF CHARACTR[ CHARX].WEPVSTY3[ 1][ BATTLERC[ BATG].B.BREATHE] 
                      THEN
                    HITDAM := (HITDAM + 1) DIV 2;
                  UNAFFECT( 0, CHARX, HITDAM)
                END
            END
        END;
    
        
      
      PROCEDURE DOFIGHT;  (* P010907 *)
      
        PROCEDURE DAM2ME;  (* P010908 *)
        
          VAR
               HPCALCPC : INTEGER;
               RECSI    : INTEGER;
               MYVICTIM : INTEGER;
               HPDAMAGE : INTEGER;
               HITSCNT  : INTEGER;
        
        
          PROCEDURE CASEDAMG;  (* P010909 *)
          
            PROCEDURE DRAINLEV;  (* P01090A *)
            
              BEGIN 
                IF CHARACTR[ MYVICTIM].WEPVSTY3[ 1][ 4] THEN
                  EXIT( DRAINLEV);
                CHARACTR[ MYVICTIM].CHARLEV := CHARACTR[ MYVICTIM].CHARLEV -
                  BATTLERC[ BATG].B.DRAINAMT;
                MVCURSOR( 1, 14);
                CLRRECT( 1, 14, 38, 1);
                PRINTNUM( BATTLERC[ BATG].B.DRAINAMT, 2);
                IF BATTLERC[ BATG].B.DRAINAMT = 1 THEN
                  PRINTSTR( ' LEVEL')
                ELSE
                  PRINTSTR( ' LEVELS');
                PRINTSTR( ' ARE DRAINED!');
                IF CHARACTR[ MYVICTIM].CHARLEV < 1 THEN
                  BEGIN
                    CHARACTR[ MYVICTIM].CHARLEV := 0;
                    BATTLERC[ 0].A.TEMP04[ MYVICTIM].HPLEFT := 0;
                    BATTLERC[ 0].A.TEMP04[ MYVICTIM].STATUS := LOST
                  END
                ELSE
                  BEGIN
                    CHARACTR[ MYVICTIM].HPMAX := 
                      (CHARACTR[ MYVICTIM].HPMAX DIV
                       CHARACTR[ MYVICTIM].MAXLEVAC) *
                                                   CHARACTR[ MYVICTIM].CHARLEV;
                    CHARACTR[ MYVICTIM].MAXLEVAC :=
                                                   CHARACTR[ MYVICTIM].CHARLEV;
                    IF CHARACTR[ MYVICTIM].HPLEFT >
                                                 CHARACTR[ MYVICTIM].HPMAX THEN
                      CHARACTR[ MYVICTIM].HPLEFT := CHARACTR[ MYVICTIM].HPMAX;
                    DRAINED[ MYVICTIM] := TRUE
                  END;
                PAUSE1
              END;   (* DRAINLEV *)
              
              
            PROCEDURE RESULT( ATTK0123: INTEGER;  (* P01090B *)
                              STONFLAG: INTEGER;
                              POISSTON: INTEGER;
                              DAMSTR:   STRING);
            
              VAR
                   CHANCBAD : INTEGER;
            
              BEGIN
                IF (RANDOM MOD 20) >
                                  CHARACTR[ MYVICTIM].LUCKSKIL[ STONFLAG] THEN
                  EXIT( RESULT);
                IF ATTK0123 = 3 THEN
                  BEGIN
                    CHANCBAD := BATTLERC[ BATG].B.HPREC.LEVEL * 2;
                    IF CHANCBAD > 50 THEN
                      CHANCBAD := 50;
                    IF (RANDOM MOD 100) > CHANCBAD THEN
                      EXIT( RESULT)
                  END;
                IF POISSTON > 0 THEN
                  IF CHARACTR[ MYVICTIM].WEPVSTY3[ 1][ POISSTON] THEN
                    EXIT( RESULT);
                IF CHARACTR[ MYVICTIM].STATUS >= DEAD THEN
                  EXIT( RESULT);
                CLRRECT( 1, 14, 38, 1);
                MVCURSOR( 1, 14);
                PRNAME( 0, MYVICTIM);
                PRINTSTR( 'IS ');
                PRINTSTR( DAMSTR );
                CASE ATTK0123 OF
                
                  0:  IF BATTLERC[ 0].A.TEMP04[ MYVICTIM].STATUS < STONED THEN
                        BATTLERC[ 0].A.TEMP04[ MYVICTIM].STATUS := STONED;
                
                  1:  CHARACTR[ MYVICTIM].LOSTXYL.POISNAMT[ 1] := 1;
                     
                  2:  IF BATTLERC[ 0].A.TEMP04[ MYVICTIM].STATUS < PLYZE THEN
                        BATTLERC[ 0].A.TEMP04[ MYVICTIM].STATUS := PLYZE;
                       
                  3:  BEGIN
                        BATTLERC[ 0].A.TEMP04[ MYVICTIM].STATUS := DEAD;
                        BATTLERC[ 0].A.TEMP04[ MYVICTIM].HPLEFT := 0
                      END
                END;
                PAUSE1
              END;  (* RESULT *)
            
            
            BEGIN  (* CASEDAMG *)
              WITH BATTLERC[ BATG].B DO
                BEGIN
                  IF SPPC[ 1] THEN
                    RESULT( 1, 0, 3, 'POISONED');
                  IF SPPC[ 2] THEN
                    RESULT( 2, 0, 0, 'PARALYZED');
                  IF SPPC[ 0] THEN
                    RESULT( 0, 1, 5, 'STONED');
                    
                  IF DRAINAMT > 0 THEN
                    DRAINLEV;
                    
                  IF SPPC[ 3] THEN
                    RESULT( 3, 0, 0, 'CRITICALLY HIT')
                END
            END;  (* CASEDAMG *)
            
            
          PROCEDURE ATTKSTRG;  (* P01090C *)
          
            PROCEDURE RIPBITCL;  (* P01090D *)
            
              BEGIN
                CASE (RANDOM MOD 5) OF
                  0:  PRINTSTR( 'TEARS');
                  1:  PRINTSTR( 'RIPS');
                  2:  PRINTSTR( 'GNAWS');
                  3:  PRINTSTR( 'BITES');
                  4:  PRINTSTR( 'CLAWS')
                END
              END;
              
              
            PROCEDURE ARMRIP;  (* P01090E *)
            
              BEGIN
                IF (RANDOM MOD 2) = 1 THEN
                  RIPBITCL
                ELSE
                  ARMATTK
              END;
            
            
            BEGIN (* ATTKSTRG *)
              CASE BATTLERC[ BATG].B.CLASS OF
                0, 1, 2, 3, 4, 5, 10, 11: ARMATTK;
                            6, 8, 12, 13: RIPBITCL;
                                    7, 9: ARMRIP;
              END
            END;
          
          
          BEGIN (* DAM2ME *)
            IF BATTLERC[ 0].A.TEMP04[ VICTIM].STATUS >= DEAD THEN
              EXIT( DAM2ME);
            PRNAME( BATG, BATI);
            ATTKSTRG;
            PRINTSTR( ' AT');
            MVCURSOR( 1, 12);
            PRINTSTR( CHARACTR[ VICTIM].NAME);
            MYVICTIM := VICTIM;
            IF BATTLERC[ 0].A.TEMP04[ MYVICTIM].STATUS < DEAD THEN
              BEGIN
                HPCALCPC :=
                  20
                  - CHARACTR[ MYVICTIM].ARMORCL 
                  - BATTLERC[ BATG].B.HPREC.LEVEL
                  + ACMOD2
                  + BATTLERC[ 0].A.TEMP04[ MYVICTIM].ARMORCL
                  + 2 * (ORD( BATTLERC[ BATG].A.TEMP04[ MYVICTIM].SPELLHSH = 0));
              
                IF HPCALCPC < 1 THEN
                  HPCALCPC := 1
                ELSE
                  IF HPCALCPC > 19 THEN
                    HPCALCPC := 19;
                HPDAMAGE := 0;
                HITSCNT := 0;
                MVCURSOR( 1, 13);
                FOR RECSI := 1 TO BATTLERC[ BATG].B.RECSN DO
                  IF (RANDOM MOD 20) >= HPCALCPC THEN
                    BEGIN
                      HPDAMAGE := HPDAMAGE +
                       CALCHP( BATTLERC[ BATG].B.RECS[ RECSI]);
                      HITSCNT := HITSCNT + 1
                    END;
                IF BATTLERC[ 0].A.TEMP04[ MYVICTIM].STATUS = ASLEEP THEN
                  HPDAMAGE := HPDAMAGE * 2;
                IF HPDAMAGE = 0 THEN
                    PRINTSTR( 'AND MISSES!')
                ELSE
                  BEGIN
                    PRINTSTR( 'AND HITS ');
                    PRINTNUM( HITSCNT, 3);
                    PRINTSTR( ' TIMES FOR ');
                    PRINTNUM( HPDAMAGE, 3);
                    PRINTSTR( ' DAMAGE');
                    CASEDAMG
                  END;
                
                BATTLERC[ 0].A.TEMP04[ MYVICTIM].HPLEFT :=
                  BATTLERC[ 0].A.TEMP04[ MYVICTIM].HPLEFT - HPDAMAGE;
                IF BATTLERC[ 0].A.TEMP04[ MYVICTIM].HPLEFT <= 0 THEN
                  BEGIN
                    CLRRECT( 1, 14, 38, 1);
                    MVCURSOR( 1, 14);
                    PRINTSTR( CHARACTR[ MYVICTIM].NAME);
                    PRINTSTR( ' IS SLAIN!');
                    BATTLERC[ 0].A.TEMP04[ MYVICTIM].HPLEFT := 0;
                    IF BATTLERC[ 0].A.TEMP04[ MYVICTIM].STATUS < DEAD THEN
                      BATTLERC[ 0].A.TEMP04[ MYVICTIM].STATUS := DEAD
                  END
              END
          END;  (* DAM2ME *)
          
          
        PROCEDURE DAM2ENMY;  (* P01090F *)
        
          VAR
               HPCALCPC : INTEGER;
               TEMPX    : INTEGER;  (* MULTIPLE USES *)
               SINGLEX  : INTEGER;
               HPDAMAGE : INTEGER;
               HITSCNT  : INTEGER;
        
          BEGIN
            SINGLEX := BATI MOD BATTLERC[ VICTIM].A.ALIVECNT;
            IF BATTLERC[ VICTIM].A.TEMP04[ SINGLEX].STATUS < DEAD THEN
              BEGIN
                PRNAME( BATG, BATI);
                ARMATTK;
                PRINTSTR( ' AT A');
                MVCURSOR( 1, 12);
                PRNAME( VICTIM, BATI);
                HPCALCPC := 21
                              - BATTLERC[ VICTIM].B.AC
                              - CHARACTR[ BATI].HPCALCMD
                              + BATTLERC[ VICTIM].A.TEMP04[ SINGLEX].ARMORCL
                              - 3 * VICTIM;
                IF HPCALCPC < 1 THEN
                  HPCALCPC := 1
                ELSE
                  IF HPCALCPC > 19 THEN
                    HPCALCPC := 19;
                HPDAMAGE := 0;
                MVCURSOR( 1, 13);
                HITSCNT := 0;
                FOR TEMPX := 1 TO CHARACTR[ BATI].SWINGCNT DO
                  IF (RANDOM MOD 20) >= HPCALCPC THEN
                    BEGIN
                      HPDAMAGE := HPDAMAGE + CALCHP( CHARACTR[ BATI].HPDAMRC);
                      HITSCNT := HITSCNT + 1
                    END;
                IF BATTLERC[ VICTIM].A.TEMP04[ SINGLEX].STATUS = ASLEEP THEN
                  HPDAMAGE := 2 * HPDAMAGE;
                IF CHARACTR[ BATI].WEPVSTYP[ BATTLERC[ VICTIM].B.CLASS] THEN
                  HPDAMAGE := 2 * HPDAMAGE;
                IF HPDAMAGE = 0 THEN
                  PRINTSTR( 'AND MISSES')
                ELSE
                  BEGIN
                    PRINTSTR( 'AND HITS ');
                    PRINTNUM( HITSCNT, 3);
                    PRINTSTR( ' TIMES FOR ');
                    PRINTNUM( HPDAMAGE, 3);
                    PRINTSTR( ' DAMAGE!');
                  END;
                BATTLERC[ VICTIM].A.TEMP04[ SINGLEX].HPLEFT :=
                  BATTLERC[ VICTIM].A.TEMP04[ SINGLEX].HPLEFT - HPDAMAGE;
                IF (CHARACTR[ BATI].CRITHITM) AND (HPDAMAGE > 0) THEN
                  BEGIN
                    TEMPX := CHARACTR[ BATI].CHARLEV * 2;
                    IF TEMPX > 50 THEN
                      TEMPX := 50;
                    IF (RANDOM MOD 100) < TEMPX THEN
                      IF (RANDOM MOD 35) >
                         BATTLERC[ VICTIM].B.HPREC.LEVEL + 10 THEN
                        BEGIN
                          MVCURSOR( 1, 14);
                          PRINTSTR( 'A CRITICAL HIT!');
                          WRITE( '');
                          BATTLERC[ VICTIM].A.TEMP04[ SINGLEX].HPLEFT := 0;
                          PAUSE1;
                          CLRRECT( 1, 14, 38, 1)
                        END;
                  END;
                IF BATTLERC[ VICTIM].A.TEMP04[ SINGLEX].HPLEFT <= 0 THEN
                  BEGIN
                    MVCURSOR( 1, 14);
                    PRNAME( 0, BATI);
                    PRINTSTR( 'KILLS ONE!');
                    BATTLERC[ VICTIM].A.TEMP04[ SINGLEX].HPLEFT := 0;
                    BATTLERC[ VICTIM].A.TEMP04[ SINGLEX].STATUS := DEAD
                  END
              END
          END;
          
          
        BEGIN  (* DOFIGHT *)
          IF BATG = 0 THEN
            DAM2ENMY
          ELSE
            DAM2ME
        END;
        
      
      
      PROCEDURE YELLHELP;  (* P010910 *)
      
        VAR
             YHTEMP2 : INTEGER;
      
      
        PROCEDURE NONECOME;  (* P010911 *)
        
          BEGIN
            PRINTSTR( 'BUT NONE COMES!');
            EXIT( YELLHELP)
          END;
        
        
        BEGIN  (* YELLHELP *)
          PRINTSTR( 'CALLS FOR HELP!');
          MVCURSOR( 1, 12);
          IF BATTLERC[ BATG].A.ALIVECNT = 9 THEN
            NONECOME;
          IF (RANDOM MOD 200) > 10 * BATTLERC[ BATG].B.HPREC.LEVEL THEN
            NONECOME;
          PRINTSTR( 'AND IS HEARD!');
          YHTEMP2 := BATTLERC[ BATG].A.ALIVECNT;
          BATTLERC[ BATG].A.ALIVECNT := YHTEMP2 + 1;
          BATTLERC[ BATG].A.ENMYCNT := BATTLERC[ BATG].A.ENMYCNT + 1;
          WITH BATTLERC[ BATG].A.TEMP04[ YHTEMP2] DO
            BEGIN
              AGILITY  := -1;
              SPELLHSH := 0;
              INAUDCNT := BATTLERC[ BATG].A.TEMP04[ BATI].INAUDCNT;
              ARMORCL  := 0;
              HPLEFT   := CALCHP( BATTLERC[ BATG].B.HPREC);
              STATUS   := OK;
            END
        END;  (* YELLHELP *)
        
        
      PROCEDURE DORUN;  (* P010912 *)
      
        BEGIN
          PRINTSTR( 'FLEES!');
          BATTLERC[ BATG].A.ENMYCNT := BATTLERC[ BATG].A.ENMYCNT - 1;
          WITH BATTLERC[ BATG].A.TEMP04[ BATI] DO
            BEGIN
              STATUS := DEAD;
              HPLEFT := 0
            END
        END;
        
        
      PROCEDURE DODISPEL;  (* P010913 *)
      
        VAR
             DISPLCNT : INTEGER;
             CHARX    : INTEGER;
             DISPCALC : INTEGER;
             
        BEGIN
          PRINTSTR( 'DISPELLS!');
          DISPCALC := 50 + 5 * CHARACTR[ BATI].CHARLEV -
                      10 * BATTLERC[ VICTIM].B.HPREC.LEVEL;
                      
          CASE CHARACTR[ BATI].CLASS OF
            LORD:    DISPCALC := DISPCALC - 40;
            BISHOP:  DISPCALC := DISPCALC - 20;
          END;
          
          DISPLCNT := 0;
          FOR CHARX := 0 TO BATTLERC[ VICTIM].A.ALIVECNT - 1 DO
            IF BATTLERC[ VICTIM].A.TEMP04[ CHARX].STATUS = OK THEN
              IF (RANDOM MOD 100) < DISPCALC THEN
                IF BATTLERC[ VICTIM].B.CLASS = 10 THEN
                  BEGIN
                    DISPLCNT := DISPLCNT + 1;
                    BATTLERC[ VICTIM].A.ENMYCNT := 
                      BATTLERC[ VICTIM].A.ENMYCNT - 1;
                    BATTLERC[ VICTIM].A.TEMP04[ CHARX].STATUS := DEAD;
                    BATTLERC[ VICTIM].A.TEMP04[ CHARX].HPLEFT := 0
                  END;
          MVCURSOR( 1, 12);
          IF DISPLCNT = 0 THEN
            PRINTSTR( 'TO NO AVAIL!')
          ELSE
            IF DISPLCNT = 1 THEN
              PRINTSTR( '1 DISSOLVES!')
            ELSE
              BEGIN
                PRINTNUM( DISPLCNT, 1);
                PRINTSTR( ' DISSOLVE!')
              END
        END;
        
        
      BEGIN  (* SWINGASW P010901 *)
        IF ATTACKTY < -1 THEN
          PRNAME( BATG, BATI);
        CASE ATTACKTY OF
          -5:  DODISPEL;
          -4:  YELLHELP;
          -3:  DOBREATH;
          -2:  DORUN;
          -1:  DOFIGHT;
        END
      END;   (* SWINGASW P010901 *)
      
      
    BEGIN (* MELEE *)
      FOR AGILELEV := 1 TO 10 DO
        FOR BATG := 0 TO 4 DO
          FOR BATI := 0 TO BATTLERC[ BATG].A.ALIVECNT - 1 DO
            IF BATTLERC[ BATG].A.TEMP04[ BATI].STATUS = OK THEN
              IF BATTLERC[ BATG].A.TEMP04[ BATI].AGILITY = AGILELEV THEN
                BEGIN
                  VICTIM := BATTLERC[ BATG].A.TEMP04[ BATI].VICTIM;
                  ATTACKTY := BATTLERC[ BATG].A.TEMP04[ BATI].SPELLHSH;
                  MVCURSOR( 1, 11);
                  IF (ATTACKTY >= -5) AND
                     (ATTACKTY <   0) THEN
                    SWINGASW                (* -5..-1 *)
                  ELSE IF ATTACKTY > 0 THEN
                    CASTASPE;
                  IF ATTACKTY <> 0 THEN
                    BEGIN
                      PAUSE1;
                      CLRRECT( 1, 11, 38, 4)
                    END
                END
    END;  (* MELEE *)
    
    
(* COMBAT SEGMENT *)
      
      
    
    BEGIN (* COMBAT P010401 *)
    
      DONEFIGH := FALSE;
      CINITFL1 := 0;
      CINIT;
      XGOTO := XREWARD;
      REPEAT
        CUTIL;
        IF NOT DONEFIGH THEN
          MELEE;
      UNTIL DONEFIGH;
      CINITFL1 := 2;
      CINIT
    END;  (* COMBAT *)
  

(* ========================================================================== *)
(* DISK: Wiz1C.DSK | FILE: CASTLE.TEXT                                 *)
(* ========================================================================== *)

  SEGMENT PROCEDURE CASTLE;     (* P010A01 *)
  
    TYPE
         BYTE = PACKED ARRAY[ 0..1] OF 0..255;
         
    VAR
         CPCALLED : RECORD CASE INTEGER OF  (* COPY PROTECTION CALLED *)
           1: (I: INTEGER);
           2: (P: ^BYTE);
         END;
      
      
    PROCEDURE GETPASS( VAR PASSWORD: STRING);  (* P010A02 *)
                        
      VAR
           UNUSEDXX : INTEGER;
           RANDX    : INTEGER;
           CHRCNT   : INTEGER;
                        
      BEGIN
        CHRCNT := 0;
        REPEAT
          GETKEY;
          IF INCHAR <> CHR( CRETURN) THEN
            IF CHRCNT < 15 THEN
              BEGIN
                FOR RANDX := 0 TO (RANDOM MOD 2) DO
                  WRITE( CHR( 88));
                CHRCNT := CHRCNT + 1;
                PASSWORD[ CHRCNT] := INCHAR
              END
            ELSE
              WRITE( CHR(7))
        UNTIL INCHAR = CHR( CRETURN);
        WRITELN;
        PASSWORD[ 0] := CHR( CHRCNT)
      END;  (* GETPASS *)
      
      
    PROCEDURE CHARINFO( CHARX: INTEGER);  (* P010A03 *)
    
      BEGIN
        GOTOXY( 0, 5 + CHARX);
        WRITE( CHR( 29));      (* ??? *)
        WRITE( (CHARX + 1): 2);
        WRITE( ' ');
        WRITE( CHARACTR[ CHARX].NAME);
        GOTOXY( 19, 5 + CHARX);
        WRITE( COPY( SCNTOC.ALIGN[ CHARACTR[ CHARX].ALIGN], 1, 1));
        WRITE( '-');
        WRITE( COPY( SCNTOC.CLASS[ CHARACTR[ CHARX].CLASS], 1, 3));
        WRITE( ' ');
        IF CHARACTR[ CHARX].ARMORCL > - 10 THEN
          WRITE( CHARACTR[ CHARX].ARMORCL :2)
        ELSE
          WRITE( 'LO');
        WRITE( CHARACTR[ CHARX].HPLEFT :5);
        WRITE( ' ');
        IF CHARACTR[ CHARX].STATUS = OK THEN
          IF CHARACTR[ CHARX].LOSTXYL.POISNAMT[ 1] <> 0 THEN
            WRITELN( 'POISON')
          ELSE
            WRITELN( CHARACTR[ CHARX].HPMAX :4)
        ELSE
          WRITELN( SCNTOC.STATUS[ CHARACTR[ CHARX].STATUS])
      END;
      
      
    PROCEDURE DSPTITLE( TITLESTR: STRING); (* P010A04 *)
    
      BEGIN
        IF CPCALLED.P^[ 0] <> 10 THEN
          MVCURSOR( 70, 0);  (* CRASH AND BURN *)
        GOTOXY( 0, 1);
        WRITE( '! CASTLE');
        WRITE( TITLESTR :30);
        WRITE( ' !')
      END;
      
      
    PROCEDURE DSPPARTY( TITLE : STRING);  (* P010A05 *)
    
      VAR
           CHARX : INTEGER;
    
      BEGIN
        GOTOXY( 0, 0);
        WRITELN( '+--------------------------------------+');
        DSPTITLE( TITLE);
        WRITELN;
        WRITELN( '+----------- CURRENT PARTY: -----------+');
        WRITELN;
        WRITELN( ' # CHARACTER NAME  CLASS AC HITS STATUS' );
        
        FOR CHARX := 0 TO 5 DO
          IF CHARX < PARTYCNT THEN
            CHARINFO( CHARX)
          ELSE
            WRITELN( CHR( 29));
        WRITELN( '+--------------------------------------+');
        WRITE( CHR( 11))
      END;  (* DSPPARTY *)
      
      
    PROCEDURE GILGAMSH;  (*  P010A06 *)
    
      VAR
           PRTYALGN : TALIGN;
    
    
      PROCEDURE GETALIGN;  (* P010A07 *)
      
        BEGIN
          PRTYALGN := NEUTRAL;
          FOR LLBASE04 := 0 TO PARTYCNT - 1 DO
            IF CHARACTR[ LLBASE04].ALIGN <> NEUTRAL THEN
              PRTYALGN := CHARACTR[ LLBASE04].ALIGN
        END;  (* GETALIGN *)
        
        
      PROCEDURE GILGMENU;  (* P010A08 *)
      
        VAR
             UNUSED : INTEGER;
      
      
        BEGIN (* P010A08 *)
          GOTOXY( 0, 13);
          WRITE( CHR( 11));
          WRITE( 'YOU MAY ');
          IF PARTYCNT < 6 THEN
            BEGIN
              WRITE( 'A)DD A MEMBER');
              IF PARTYCNT = 0 THEN
                WRITELN
              ELSE
                WRITELN( ',');
              WRITE( ' ' :8);
            END;
          IF PARTYCNT > 0 THEN
            BEGIN
              WRITELN( 'R)EMOVE A MEMBER,');
              WRITE( ' ' :8);
              WRITELN( '#) SEE A MEMBER,')
            END
          ELSE
            BEGIN
              WRITELN( CHR( 29));
              WRITELN( CHR( 29))
            END;
          WRITELN;
          WRITELN( 'OR PRESS [RETURN] TO LEAVE');
          WRITE( CHR(11))
        END;  (* P010A08 *)
        
        
      PROCEDURE ADDPARTY;  (* P010A09 *)
      
        VAR
             CHARI    : INTEGER;
             CHARNAME : STRING;  (* MULTIPLE USES *)
             

        PROCEDURE EXITADDP( EXITSTR: STRING);  (* P010A09 *)
        
          BEGIN
            CENTSTR( EXITSTR);
            EXIT( ADDPARTY)
          END;  (* EXITADDP *)
          
          
        BEGIN (* ADDPARTY *)
          GOTOXY( 0, 19);
          WRITE( 'WHO WILL JOIN ? >');
          GETLINE( CHARNAME);
          IF (CHARNAME = '') OR (LENGTH( CHARNAME) > 15) THEN
            EXIT( ADDPARTY);
          CHARI := 0;
          MOVELEFT( IOCACHE[ GETREC( ZCHAR, CHARI, SIZEOF( TCHAR))],
                    CHARACTR[ PARTYCNT],
                    SIZEOF( TCHAR));
          WHILE (CHARI < SCNTOC.RECPERDK[ ZCHAR]) AND
                ( (CHARNAME <> CHARACTR[ PARTYCNT].NAME) OR
                  (CHARACTR[ PARTYCNT].STATUS = LOST) ) DO
            BEGIN
              CHARI := CHARI + 1;
              MOVELEFT( IOCACHE[ GETREC( ZCHAR, CHARI, SIZEOF( TCHAR))],
                        CHARACTR[ PARTYCNT],
                        SIZEOF( TCHAR))
            END;
          IF CHARI = SCNTOC.RECPERDK[ ZCHAR] THEN
            EXITADDP( '** WHO? **')
          ELSE
            IF CHARACTR[ PARTYCNT].INMAZE OR
               (CHARACTR[ PARTYCNT].LOSTXYL.LOCATION[ 3] <> 0) THEN
              EXITADDP( '** OUT **')
            ELSE
              IF (PRTYALGN <> NEUTRAL) THEN
                IF (CHARACTR[ PARTYCNT].ALIGN <> NEUTRAL) THEN
                  IF (PRTYALGN <> CHARACTR[ PARTYCNT].ALIGN) THEN
                    EXITADDP( '** BAD ALIGNMENT **');
          GOTOXY( 0, 20);
          WRITE( 'ENTER PASSWORD  >');
          GETPASS(  CHARNAME);
          GOTOXY( 0, 21);
          IF CHARNAME <> CHARACTR[ PARTYCNT].PASSWORD THEN
            EXITADDP( '** THATS NOT IT **');
          CHARDISK[ PARTYCNT] := CHARI;
          CHARACTR[ PARTYCNT].INMAZE := TRUE;
          MOVELEFT( CHARACTR[ PARTYCNT],
                    IOCACHE[ GETRECW( ZCHAR, CHARI, SIZEOF( TCHAR))],
                    SIZEOF( TCHAR));
          IF IORESULT > 0 THEN
            EXITADDP( '** WRITE-PROTECT CHEAT! **');
          PARTYCNT := PARTYCNT + 1;
          GETALIGN;
          MOVELEFT( IOCACHE[ GETREC( ZZERO, 0, SIZEOF( TSCNTOC))],
                    SCNTOC,
                    SIZEOF( TSCNTOC));
          CHARINFO( PARTYCNT - 1);
        END;  (* ADDPARTY *)
        
        
      PROCEDURE REMOVE;  (* P010A0B *)
      
        VAR
             CHARX : INTEGER;
             CHARI : INTEGER;
      
        BEGIN
          CHARI := GETCHARX( FALSE, 'WHO WILL LEAVE');
          IF (CHARI < 0) OR (CHARI = PARTYCNT) THEN
            EXIT( REMOVE);
          CHARACTR[ CHARI].INMAZE := FALSE;
          MOVELEFT( CHARACTR[ CHARI],
                    IOCACHE[ GETRECW( ZCHAR,
                                      CHARDISK[ CHARI],
                                      SIZEOF( TCHAR))],
                    SIZEOF( TCHAR));
          IF CHARI <> (PARTYCNT - 1) THEN
            FOR CHARX := (CHARI + 1) TO (PARTYCNT - 1) DO
              BEGIN
                CHARACTR[ CHARX - 1] := CHARACTR[ CHARX];
                CHARDISK[ CHARX - 1] := CHARDISK[ CHARX]
              END;
          PARTYCNT := PARTYCNT - 1;
          GETALIGN;
          DSPPARTY( 'TAVERN')
        END;   (* REMOVE *)
        
        
      PROCEDURE EXITCASL;  (* P010A0C *)
      
        VAR
             UNUSEDX : INTEGER;
             
        BEGIN
          LLBASE04 := ORD( INCHAR) - ORD( '1');
          IF (LLBASE04 < 0) OR (LLBASE04 >= PARTYCNT) THEN
            EXIT( EXITCASL);
          MAZELEV := -1;
          XGOTO := XINSPECT;
          EXIT( CASTLE)
        END;
        
        
      BEGIN  (* GILGAMSH *)
        GETALIGN;
        DSPTITLE( 'TAVERN');
        REPEAT
          UNITCLEAR( 1);
          GILGMENU;
          GOTOXY( 41, 0);
          GETKEY;
          IF INCHAR = CHR( CRETURN) THEN
            EXIT( GILGAMSH);
          CASE INCHAR OF
            'A':  IF PARTYCNT < 6 THEN
                    ADDPARTY;
                   
            'R':  IF PARTYCNT > 0 THEN
                    REMOVE;
                   
            '1', '2', '3', '4', '5', '6':
                  IF PARTYCNT > 0 THEN
                    EXITCASL;
          END
        UNTIL FALSE
      END;   (* GILGAMSH *)
      
      
    PROCEDURE GOBOLTAC;  (* P010A0D *)
    
      BEGIN
        DSPTITLE( 'SHOP');
        XGOTO := XBOLTAC;
        XGOTO2 := XBOLTAC;
        EXIT( CASTLE)
      END;
      
      
    PROCEDURE GOTEMPLE;  (* P010A0E *)
    
      BEGIN
        DSPTITLE( 'TEMPLE');
        XGOTO := XCANT;
        XGOTO2 := XBOLTAC;
        EXIT( CASTLE)
      END;
    

(* ========================================================================== *)
(* DISK: Wiz1C.DSK | FILE: CASTLE2.TEXT                                *)
(* ========================================================================== *)

    
    PROCEDURE ADVNTINN;  (* P010A0F *)
    
      CONST
           STABLES  = 65;
           COTS     = 66;
           ECONOMY  = 67;
           MERCHANT = 68;
           ROYAL    = 69;
           
      VAR
           PARTYX : INTEGER;
    
    
      PROCEDURE GETWHO;  (* P010A10 *)
      
        BEGIN
          DSPTITLE( 'INN');
          GOTOXY( 0, 13);
          WRITE( CHR( 11));
          PARTYX := GETCHARX( FALSE, 'WHO WILL STAY');
          IF PARTYX < 0 THEN
            EXIT( ADVNTINN)
        END;
        
        
      PROCEDURE INNMENU;  (* P010A11 *)
      
        BEGIN
          GOTOXY( 0, 13);
          WRITE( CHR( 11));
          WRITE( '   WELCOME ');
          WRITE( CHARACTR[ PARTYX].NAME);
          WRITELN( '. WE HAVE:');
          WRITELN;
          WRITELN(  '[A] THE STABLES (FREE!)');
          WRITELN(  '[B] COTS. 10 GP/WEEK.');
          WRITELN(  '[C] ECONOMY ROOMS. 50 GP/WEEK.');
          WRITELN(  '[D] MERCHANT SUITES. 200 GP/WEEK.');
          WRITELN(  '[E] ROYAL SUITES. 500 GP/WEEK.');
          WRITE(    '    OR [RETURN] TO LEAVE')
        END;
        
        
      PROCEDURE SETSPELS;  (* P010A12 *)
      
      
        PROCEDURE SPLPERLV( VAR SPELGRPS: TSPELL7G;  (* P010A13 *)
                                LEVELMOD: INTEGER;
                                LEVMOD2:  INTEGER);
                           
          VAR
               UNUSEDXX : INTEGER;
               SPGRPI   : INTEGER;
               SPELLCNT : INTEGER;
        
          BEGIN
            SPELLCNT :=  CHARACTR[ PARTYX].CHARLEV - LEVELMOD;
            IF SPELLCNT <=0 THEN
              EXIT (SPLPERLV);
            SPGRPI := 1;
            WHILE (SPGRPI >= 1) AND (SPGRPI <= 7) AND (SPELLCNT > 0) DO
              BEGIN
                IF SPELLCNT > SPELGRPS[ SPGRPI] THEN
                  SPELGRPS[ SPGRPI] := SPELLCNT;
                SPGRPI := SPGRPI + 1;
                SPELLCNT := SPELLCNT - LEVMOD2
              END;
            FOR SPGRPI := 1 TO 7 DO
              IF SPELGRPS[ SPGRPI] > 9 THEN
                SPELGRPS[ SPGRPI] := 9
          END;  (* SPLPERLV *)
          
          
        PROCEDURE NWPRIEST( MOD1: INTEGER;  (* P010A14 *)
                            MOD2: INTEGER);
        
          BEGIN
            SPLPERLV( CHARACTR[ PARTYX].PRIESTSP, MOD1, MOD2)
          END;
          
          
        PROCEDURE NWMAGE( MOD1: INTEGER;  (* P010A15 *)
                          MOD2: INTEGER);
        
          BEGIN
            SPLPERLV( CHARACTR[ PARTYX].MAGESP, MOD1, MOD2)
          END;
          
          
        PROCEDURE MINSPCNT( VAR SPLGRPS:  TSPELL7G;  (* P010A16 *)
                                GROUPI:   INTEGER;
                                LOWINDX:  INTEGER;
                                HIGHINDX: INTEGER);
                           
          VAR
               SPELLI   : INTEGER;
               SPELKNOW : INTEGER;
                           
          BEGIN
            SPELKNOW := 0;
            FOR SPELLI := LOWINDX TO HIGHINDX DO
              IF CHARACTR[ PARTYX].SPELLSKN[ SPELLI] THEN
                SPELKNOW := SPELKNOW + 1;
            SPLGRPS[ GROUPI] := SPELKNOW
          END;
          
          
        PROCEDURE MINMAG;  (* P010A17 *)
        
          BEGIN
            WITH CHARACTR[ PARTYX] DO
              BEGIN
                MINSPCNT( MAGESP, 1,  1,  4);
                MINSPCNT( MAGESP, 2,  5,  6);
                MINSPCNT( MAGESP, 3,  7,  8);
                MINSPCNT( MAGESP, 4,  9, 11);
                MINSPCNT( MAGESP, 5, 12, 14);
                MINSPCNT( MAGESP, 6, 15, 18);
                MINSPCNT( MAGESP, 7, 19, 21)
              END
          END;
          
          
        PROCEDURE MINPRI;  (* P010A18 *)
        
          BEGIN
            WITH CHARACTR[ PARTYX] DO
              BEGIN
                MINSPCNT( PRIESTSP, 1, 22, 26);
                MINSPCNT( PRIESTSP, 2, 27, 30);
                MINSPCNT( PRIESTSP, 3, 31, 34);
                MINSPCNT( PRIESTSP, 4, 35, 38);
                MINSPCNT( PRIESTSP, 5, 39, 44);
                MINSPCNT( PRIESTSP, 6, 45, 48);
                MINSPCNT( PRIESTSP, 7, 49, 50)
              END
          END;  (* MINPRI *)
      
      
        BEGIN  (* SETSPELS *)
          MINPRI;
          MINMAG;
          CASE CHARACTR[ PARTYX].CLASS OF
             PRIEST:  NWPRIEST( 0, 2);
               MAGE:  NWMAGE(   0, 2);
             BISHOP:  BEGIN
                        NWPRIEST( 3, 4);
                        NWMAGE(   0, 4)
                      END;
               LORD:  NWPRIEST( 3, 2);
            SAMURAI:  NWMAGE(   3, 3)
          END
        END;  (* SETSPELS *)
        
        
      PROCEDURE CHNEWLEV;  (* P010A19 *)
      
        VAR
             EXP2NEXT : TEXP;
             UNUSEDXX : TWIZLONG;
             BIGLEV   : INTEGER;
             EXPNXTLV : TWIZLONG;
      
      
        PROCEDURE MADELEV;  (* P010A1A *)
        
          VAR
               CHARLEV  : INTEGER;
               NEWHPMAX : INTEGER;
        
        
          FUNCTION MOREHP : INTEGER;  (* P010A1B *)
          
            VAR
                 HITPTS : INTEGER;
          
            BEGIN
              CASE CHARACTR[ PARTYX].CLASS OF
                FIGHTER, LORD:         HITPTS := RANDOM MOD 10;
                PRIEST, SAMURAI:       HITPTS := RANDOM MOD 8;
                THIEF, BISHOP, NINJA:  HITPTS := RANDOM MOD 6;
                MAGE:                  HITPTS := RANDOM MOD 4;
              END;
              
              HITPTS := HITPTS + 1;
              
              CASE CHARACTR[ PARTYX].ATTRIB[ VITALITY] OF
                3:     HITPTS := HITPTS - 2;
                4, 5:  HITPTS := HITPTS - 1;
                16:    HITPTS := HITPTS + 1;
                17:    HITPTS := HITPTS + 2;
                18:    HITPTS := HITPTS + 3;
              END;
              
              IF HITPTS < 1 THEN
                HITPTS := 1;
              MOREHP := HITPTS
            END;  (* MOREHP *)
            
            
          PROCEDURE TRYLEARN;  (* P010A1C *)
          
            VAR
                 IQPIETY : TATTRIB;
                 LEARNED : BOOLEAN;
          
          
            PROCEDURE TRY2LRN( LOWINDX:  INTEGER;  (* P010A1D *)
                               HIGHINDX: INTEGER);
            
              VAR
                   SPELLI   : INTEGER;
                   SPLKNOWN : BOOLEAN;
            
              BEGIN
                SPLKNOWN := FALSE;
                FOR SPELLI := LOWINDX TO HIGHINDX DO
                  SPLKNOWN := SPLKNOWN OR CHARACTR[ PARTYX].SPELLSKN[ SPELLI];
                FOR SPELLI := LOWINDX TO HIGHINDX DO
                  IF NOT (CHARACTR[ PARTYX].SPELLSKN[ SPELLI]) THEN
                    IF ((RANDOM MOD 30) <
                        CHARACTR[ PARTYX].ATTRIB[ IQPIETY]) OR
                       (NOT SPLKNOWN) THEN
                      BEGIN
                        LEARNED := TRUE;
                        SPLKNOWN := TRUE;
                        CHARACTR[ PARTYX].SPELLSKN[ SPELLI] := TRUE
                      END
              END;  (* TRY2LRN *)
              
              
            PROCEDURE TRYMAGE;  (* P010A1E *)
            
              BEGIN
                IQPIETY := IQ;
                WITH CHARACTR[ PARTYX] DO
                  BEGIN
                    IF MAGESP[ 1] > 0 THEN
                      TRY2LRN( 1, 4);
                    IF MAGESP[ 2] > 0 THEN
                      TRY2LRN( 5, 6);
                    IF MAGESP[ 3] > 0 THEN
                      TRY2LRN( 7, 8);
                    IF MAGESP[ 4] > 0 THEN
                      TRY2LRN( 9, 11);
                    IF MAGESP[ 5] > 0 THEN
                      TRY2LRN( 12, 14);
                    IF MAGESP[ 6] > 0 THEN
                      TRY2LRN( 15, 18);
                    IF MAGESP[ 7] > 0 THEN
                      TRY2LRN( 19, 21)
                  END
              END;  (* TRYMAGE *)
              
              
            PROCEDURE TRYPRI;  (* P010A1F *)
            
              BEGIN
                IQPIETY := PIETY;
                WITH CHARACTR[ PARTYX] DO
                  BEGIN
                    IF PRIESTSP[ 1] > 0 THEN
                      TRY2LRN( 22, 26);
                    IF PRIESTSP[ 2] > 0 THEN
                      TRY2LRN( 27, 30);
                    IF PRIESTSP[ 3] > 0 THEN
                      TRY2LRN( 31, 34);
                    IF PRIESTSP[ 4] > 0 THEN
                      TRY2LRN( 35, 38);
                    IF PRIESTSP[ 5] > 0 THEN
                      TRY2LRN( 39, 44);
                    IF PRIESTSP[ 6] > 0 THEN
                      TRY2LRN( 45, 48);
                    IF PRIESTSP[ 7] > 0 THEN
                      TRY2LRN( 49, 50)
                  END
              END;  (* TRYPRI *)
              
              
            BEGIN  (* TRYLEARN *)
              LEARNED := FALSE;
              TRYMAGE;
              TRYPRI;
              IF LEARNED THEN
                WRITELN( 'YOU LEARNED NEW SPELLS!!!!');
              SETSPELS
            END;   (* TRYLEARN *)
        
        
          PROCEDURE GAINLOST;  (* P010A20 *)
          
            VAR
                 ATTRVAL : INTEGER;
                 ATTRIBX : TATTRIB;
          
          
            PROCEDURE PRATTRIB;  (* P010A21 *)
            
              BEGIN
                CASE ATTRIBX OF
                  STRENGTH:  WRITELN( 'STRENGTH');
                        IQ:  WRITELN( 'I.Q.');
                     PIETY:  WRITELN( 'PIETY');
                  VITALITY:  WRITELN( 'VITALITY');
                   AGILITY:  WRITELN( 'AGILITY');
                      LUCK:  WRITELN( 'LUCK');
                END;
              END;  (* PRATTRIB *)
              
              
            PROCEDURE OLDAGE;  (* P010A22 *)
            
              BEGIN
                WRITE(  '** YOU HAVE DIED OF OLD AGE **');
                WRITELN;
                CHARACTR[ PARTYX].STATUS := LOST;
                CHARACTR[ PARTYX].HPLEFT := 0;
                EXIT( GAINLOST)
              END;
          
          
            BEGIN (* GAINLOST *)
              FOR ATTRIBX := STRENGTH TO LUCK DO
                BEGIN
                  IF (RANDOM MOD 4) <> 0 THEN
                    BEGIN
                      ATTRVAL := CHARACTR[ PARTYX].ATTRIB[ ATTRIBX];
                      IF (RANDOM MOD 130) <
                         (CHARACTR[ PARTYX].AGE DIV 52) THEN
                        IF (ATTRVAL = 18) AND
                           ((RANDOM MOD 6) <> 4) THEN
                          (* NOTHING *)
                        ELSE
                          BEGIN
                            ATTRVAL := ATTRVAL - 1;
                            WRITE(  'YOU LOST ');
                            PRATTRIB;
                            IF ATTRIBX = VITALITY THEN
                              IF ATTRVAL = 2 THEN
                                OLDAGE
                          END
                      ELSE
                        BEGIN
                          IF ATTRVAL <> 18 THEN
                            BEGIN
                              ATTRVAL := ATTRVAL + 1;
                              WRITE(  'YOU GAINED ');
                              PRATTRIB
                            END
                        END;
                      CHARACTR[ PARTYX].ATTRIB[ ATTRIBX] := ATTRVAL
                    END
                END
            END;  (* GAINLOST *)
        
        
          BEGIN  (* MADELEV *)
            WRITE( 'YOU MADE A LEVEL!');
            WRITELN;
            CHARACTR[ PARTYX].CHARLEV := CHARACTR[ PARTYX].CHARLEV + 1;
            IF CHARACTR[ PARTYX].CHARLEV > CHARACTR[ PARTYX].MAXLEVAC THEN
              CHARACTR[ PARTYX].MAXLEVAC := CHARACTR[ PARTYX].CHARLEV;
            SETSPELS;
            TRYLEARN;
            GAINLOST;
            
            NEWHPMAX := 0;
            FOR CHARLEV := 1 TO CHARACTR[ PARTYX].CHARLEV DO
              NEWHPMAX := NEWHPMAX + MOREHP;
            IF CHARACTR[ PARTYX].CLASS = SAMURAI THEN
              NEWHPMAX := NEWHPMAX + MOREHP;
            IF NEWHPMAX <= CHARACTR[ PARTYX].HPMAX THEN
              NEWHPMAX := CHARACTR[ PARTYX].HPMAX + 1;
            CHARACTR[ PARTYX].HPMAX := NEWHPMAX
        END;  (* MADELEV *)
        
        
        BEGIN (* CHNEWLEV *)
          MOVELEFT( IOCACHE[ GETREC( ZEXP, 0, SIZEOF( TEXP))],
                    EXP2NEXT,
                    SIZEOF( TEXP));
          WITH CHARACTR[ PARTYX] DO
            BEGIN
              IF CHARLEV <= 12 THEN
                EXPNXTLV := EXP2NEXT[ CLASS][ CHARLEV]
              ELSE
                BEGIN
                  EXPNXTLV := EXP2NEXT[ CLASS][ 12];
                  FOR BIGLEV := 13 TO CHARLEV DO
                    ADDLONGS( EXPNXTLV, EXP2NEXT[ CLASS][ 0])
                END;
                
              IF TESTLONG( EXPNXTLV, EXP) <= 0 THEN
                MADELEV
              ELSE
                BEGIN
                  WRITE( 'YOU NEED ');
                  SUBLONGS( EXPNXTLV, EXP);
                  PRNTLONG( EXPNXTLV);
                  WRITELN( ' MORE');
                  WRITELN( 'EXPERIENCE POINTS TO MAKE LEVEL')
                END
            END
        END;  (* CHNEWLEV *)
        
        
      PROCEDURE TAKENAP( HPADD:   INTEGER;  (* P010A23 *)
                         GOLDAMT: INTEGER);
      
        VAR
             GOLD4NAP : TWIZLONG;
             PAUSEX   : INTEGER;
      
      
        PROCEDURE HEALHP;  (* P010A24 *)
        
          BEGIN
            GOTOXY( 0, 13);
            CHARACTR[ PARTYX].HPLEFT := CHARACTR[ PARTYX].HPLEFT + HPADD;
            IF CHARACTR[ PARTYX].HPLEFT > CHARACTR[ PARTYX].HPMAX THEN
              CHARACTR[ PARTYX].HPLEFT := CHARACTR[ PARTYX].HPMAX;
            SUBLONGS( CHARACTR[ PARTYX].GOLD, GOLD4NAP);
            WRITE( CHARACTR[ PARTYX].NAME);
            WRITELN( ' IS HEALING UP');
            WRITELN;
            WRITELN;
            WRITE( '         HIT POINTS (');
            WRITE( CHARACTR[ PARTYX].HPLEFT);
            WRITE( '/');
            WRITE( CHARACTR[ PARTYX].HPMAX);
            WRITE( ')');
            WRITELN;
            WRITELN;
            WRITE( '               GOLD  ');
            PRNTLONG( CHARACTR[ PARTYX].GOLD);
            GOTOXY( 41, 10);
            FOR PAUSEX := 1 TO 500 DO
              ;
            
          END;  (* HEALHP *)
          
          
        BEGIN  (* TAKENAP *)
          GOLD4NAP.HIGH := 0;
          GOLD4NAP.MID  := 0;
          GOLD4NAP.LOW  := GOLDAMT;
          GOTOXY( 0, 13);
          WRITE( CHR( 11));
          IF GOLDAMT > 0 THEN
            WHILE (TESTLONG( CHARACTR[ PARTYX].GOLD, GOLD4NAP) >= 0) AND
                  (CHARACTR[ PARTYX].HPLEFT < CHARACTR[ PARTYX].HPMAX) AND
                   (NOT KEYAVAIL) DO
              HEALHP
          ELSE
            BEGIN
              WRITE( CHARACTR[ PARTYX].NAME);
              WRITELN( ' IS NAPPING');
            END;
          IF KEYAVAIL THEN
            BEGIN
              GOTOXY( 41, 0);
              GETKEY
            END;
          GOTOXY( 0, 13);
          WRITE( CHR(11));
          CHNEWLEV;
          SETSPELS;
          GOTOXY(  0, 23);
          WRITE(  'PRESS [RETURN] TO LEAVE');
          GOTOXY( 41, 0);
          REPEAT
            GETKEY
          UNTIL INCHAR = CHR( CRETURN);
          INCHAR := CHR( 0)
        END;   (* TAKENAP *)
        
        
      BEGIN  (* ADVNTINN *)
        REPEAT
          GETWHO;
          IF CHARACTR[ PARTYX].STATUS = OK THEN
            REPEAT
              UNITCLEAR( 1);
              INNMENU;
              GOTOXY( 41, 0);
              GETKEY;
              CASE ORD( INCHAR) OF
                 STABLES:  TAKENAP(  0,   0);
                    COTS:  TAKENAP(  1,  10);
                 ECONOMY:  TAKENAP(  3,  50);
                MERCHANT:  TAKENAP(  7, 200);
                   ROYAL:  TAKENAP( 10, 500);
              END;
              CHARINFO( PARTYX)
            UNTIL (INCHAR = CHR( CRETURN)) OR
                  (CHARACTR[ PARTYX].STATUS <> OK)
        UNTIL FALSE
      END;  (* ADVNTINN *)
      
      
    PROCEDURE EXTCASTL;  (* P010A25 *)
    
      BEGIN
        DSPTITLE( 'EXIT');
        XGOTO := XEDGTOWN;
        EXIT( CASTLE)
      END;
      
      
    PROCEDURE P010A26;  (* P010A26 *)
    
      BEGIN
        GOTOXY( 0, 13);
        WRITE( CHR( 11));
        WRITE( ' ' : 13);
        WRITELN( 'YOU MAY GO TO:');
        WRITELN;
        WRITELN( 'THE A)DVENTURER''S INN, G)ILGAMESH''');
        WRITELN( 'TAVERN, B)OLTAC''S TRADING POST, THE');
        WRITELN( 'TEMPLE OF C)ANT, OR THE E)DGE OF TOWN.')
      END;
      
    
    BEGIN  (* CASTLE  P010A01 *)
      ACMOD2   := 0;
      LIGHT    := 0;
      CHSTALRM := 0;
      
      CPCALLED.I := 1145;  (* $0479  SLOT#1 RAM SPACE *)
      
      ATTK012  := 0;
      FIZZLES  := 0;
      TEXTMODE;
      IF CPCALLED.P^[ 0] <> 10 THEN
        MVCURSOR( 70, 0);  (* CRASH AND BURN *)
      IF XGOTO2 <> XBOLTAC THEN
        DSPPARTY( '');
      XGOTO2 := XGILGAMS;
      IF XGOTO = XGILGAMS THEN
        GILGAMSH;
      REPEAT
        DSPTITLE( 'MARKET');
        P010A26;
        REPEAT
          REPEAT
            GOTOXY( 41, 0);
            GETKEY
          UNTIL (INCHAR = 'A') OR (INCHAR = 'G') OR (INCHAR = 'B') OR
                (INCHAR = 'C') OR (INCHAR = 'E');
        UNTIL (PARTYCNT > 0) OR (INCHAR = 'E') OR (INCHAR = 'G');
              
        CASE INCHAR OF
          'G':  GILGAMSH;
          'A':  ADVNTINN;
          'C':  GOTEMPLE;
          'B':  GOBOLTAC;
          'E':  EXTCASTL
        END
      UNTIL FALSE
    END;   (* CASTLE  P010A01 *)
  

(* ========================================================================== *)
(* DISK: Wiz1C.DSK | FILE: ROLLER.TEXT                                 *)
(* ========================================================================== *)

SEGMENT PROCEDURE ROLLER;   (* P010B01 *)
  
    VAR
         CHARREC  : TCHAR;
         TEMPX    : INTEGER;  (* MULTIPLE USES *)
         CHARACX  : INTEGER;
         PTSLEFT  : INTEGER;
         CHARNAME : STRING;
         CHG2LST  : ARRAY[ FIGHTER..NINJA] OF BOOLEAN;
         BASEATTR : ARRAY[ STRENGTH..LUCK] OF INTEGER;
         SIXATTR2 : ARRAY[ STRENGTH..LUCK] OF INTEGER;
  
  
    PROCEDURE GETPASS( VAR PASSWORD: STRING);  (* P010B02 *)
    
      VAR
           UNUSEDXX : INTEGER;
           RANDX    : INTEGER;
           CHRCNT   : INTEGER;
      
      BEGIN
        CHRCNT := 0;
        REPEAT
          GETKEY;
          IF INCHAR <> CHR( CRETURN) THEN
            IF CHRCNT < 15 THEN
              BEGIN
                FOR RANDX := 0 TO (RANDOM MOD 2) DO
                  WRITE( CHR( 88));
                CHRCNT := CHRCNT + 1;
                PASSWORD[ CHRCNT] := INCHAR
              END
            ELSE
              WRITE( CHR( 7));
        UNTIL INCHAR = CHR( CRETURN);
        WRITELN;
        PASSWORD[ 0] := CHR( CHRCNT)
      END;
      
      
    FUNCTION GTCHGLST : BOOLEAN;  (* P010B03 *)
    
      BEGIN
        CHG2LST[ FIGHTER] :=  SIXATTR2[ STRENGTH] >= 11;
        
        CHG2LST[ MAGE]    :=  SIXATTR2[ IQ] >= 11;
        
        CHG2LST[ PRIEST]  := (SIXATTR2[ PIETY] >= 11)   AND
                             (CHARREC.ALIGN <> NEUTRAL);
                             
        CHG2LST[ THIEF]   := (SIXATTR2[ AGILITY] >= 11) AND
                             (CHARREC.ALIGN <> GOOD);
                             
        CHG2LST[ BISHOP]  := (SIXATTR2[ IQ] >= 12)      AND
                             (SIXATTR2[ PIETY] >= 12)   AND
                             (CHARREC.ALIGN <> NEUTRAL);
                            
        CHG2LST[ SAMURAI] := (SIXATTR2[ STRENGTH] >= 15) AND
                             (SIXATTR2[ IQ] >= 11)       AND
                             (SIXATTR2[ PIETY] >= 10)    AND
                             (SIXATTR2[ VITALITY] >= 14) AND
                             (SIXATTR2[ AGILITY] >= 10)  AND
                             (CHARREC.ALIGN <> EVIL);
                            
        CHG2LST[ LORD]    := (SIXATTR2[ STRENGTH] >= 15) AND
                             (SIXATTR2[ IQ] >= 12)       AND
                             (SIXATTR2[ PIETY] >= 12)    AND
                             (SIXATTR2[ VITALITY] >= 15) AND
                             (SIXATTR2[ AGILITY] >= 14)  AND
                             (SIXATTR2[ LUCK] >= 15)     AND
                             (CHARREC.ALIGN = GOOD);
                             
        CHG2LST[ NINJA]   := (SIXATTR2[ STRENGTH] >= 17) AND
                             (SIXATTR2[ IQ] >= 17)       AND
                             (SIXATTR2[ PIETY] >= 17)    AND
                             (SIXATTR2[ VITALITY] >= 17) AND
                             (SIXATTR2[ AGILITY] >= 17)  AND
                             (SIXATTR2[ LUCK] >= 17)     AND
                             (CHARREC.ALIGN = EVIL);
                            
        GTCHGLST := CHG2LST[ FIGHTER] OR
                    CHG2LST[ MAGE]    OR
                    CHG2LST[ PRIEST]  OR
                    CHG2LST[ THIEF]   OR
                    CHG2LST[ BISHOP]  OR
                    CHG2LST[ LORD]    OR
                    CHG2LST[ SAMURAI] OR
                    CHG2LST[ NINJA]
      END;
      
      
    PROCEDURE SETBASE;  (* P010B04 *)
    
      PROCEDURE SETXBASE( BASESTR: STRING);  (* P010B05 *)
      
        VAR
             ATTRI : INTEGER;
             ATTR  : TATTRIB;
      
        BEGIN
          ATTR := STRENGTH;
          FOR ATTRI := 1 TO 6 DO
            BEGIN
              BASEATTR[ ATTR] := ORD( BASESTR[ ATTRI]) - ORD( '0');
              ATTR := SUCC( ATTR)
            END
        END;  (* SETXBASE *)
        
        
      BEGIN  (* SETBASE *)
        CASE CHARREC.RACE OF            (*  S, I, P, V, A, L *)
           HUMAN:  SETXBASE( '885889'); (*  8  8  5  8  8  9 *)
             ELF:  SETXBASE( '7::696'); (*  7 10 10  6  9  6 *)
           DWARF:  SETXBASE( ':7::56'); (* 10  7 10 10  5  6 *)
           GNOME:  SETXBASE( '77:8:7'); (*  7  7 10  8 10  7 *)
          HOBBIT:  SETXBASE( '5776:?')  (*  5  7  7  6 10 15 *)
        END
      END;  (* SETBASE *)
      
      
    PROCEDURE GETCHARC( VAR BUFFER: TCHAR;  (* P010B06 *)
                            CHINDX: INTEGER);
    
      BEGIN
        MOVELEFT( IOCACHE[ GETREC(  ZCHAR, CHINDX, SIZEOF( TCHAR))],
                  BUFFER,
                  SIZEOF( TCHAR))
      END;
      
      
    PROCEDURE PUTCHARC( VAR BUFFER: TCHAR;  (* P010B07 *)
                            CHINDX: INTEGER);
    
      BEGIN
        MOVELEFT( BUFFER,
                  IOCACHE[ GETRECW( ZCHAR, CHINDX, SIZEOF( TCHAR))],
                  SIZEOF( TCHAR))
      END;
      
      
    PROCEDURE GTSCNTOC;  (* P010B08 *)
    
      BEGIN
        MOVELEFT( IOCACHE[ GETREC( ZZERO, 0, SIZEOF( SCNTOC))],
                  SCNTOC,
                  SIZEOF( SCNTOC))
      END;
      
      
    PROCEDURE MAKECHAR;  (* P010B09 *)
      
      
      PROCEDURE INITCHAR;  (* P010B0A *)
      
        VAR
             LSI    : INTEGER;
             UNUSED : INTEGER;
      
        BEGIN
          FILLCHAR( CHARREC, SIZEOF( CHARREC), 0);
          CHARREC.NAME := CHARNAME;
          CHARREC.AGE := (18 * 52) + (RANDOM MOD 300);
          CHARREC.GOLD.LOW := 90 + (RANDOM MOD 100);
          CHARREC.STATUS := OK;
          FOR LSI := 0 TO 4 DO
            BEGIN
              CHARREC.LUCKSKIL[ LSI] := 16
            END;
          CHARREC.MAXLEVAC := 1;
          CHARREC.CHARLEV := 1;
          CHARREC.ARMORCL := 10
        END;
      
      
      PROCEDURE P010B0B;
      
        BEGIN
          GOTOXY( 0, 15);
          WRITE( CHR( 11))
        END;
        
        
      PROCEDURE P010B0C;
      
        BEGIN
          GOTOXY( 0, 15);
          WRITE( CHR( 29))
        END;
        
        
      PROCEDURE MAKEMENU;  (* P010B0D *)
      
        VAR
             PASSWD : STRING;
             
        BEGIN
          WRITE( CHR( 12));
          WRITE(   'NAME ': 10);
          WRITELN( CHARREC.NAME);
          WRITELN( 'PASSWORD': 9);
          WRITELN( 'RACE': 9);
          WRITELN( 'POINTS': 9);
          WRITELN;
          WRITELN( 'STRENGTH': 9);
          WRITELN( 'I.Q.': 9);
          WRITELN( 'PIETY': 9);
          WRITELN( 'VITALITY': 9);
          WRITELN( 'AGILITY': 9);
          WRITELN( 'LUCK': 9);
          WRITELN;
          WRITELN( 'ALIGNMENT');
          WRITELN( 'CLASS': 9);
          WRITELN;
          
          REPEAT
            P010B0B;
            WRITELN( 'ENTER A PASSWORD ([RET] FOR NONE)');
            GOTOXY( 10, 1);
            WRITE( CHR( 29));
            GOTOXY( 10, 1);
            GETPASS( CHARNAME);
            IF LENGTH( CHARNAME) > 15 THEN
              CHARNAME := COPY( CHARNAME, 1, 15);
            P010B0B;
            WRITELN( 'ENTER IT AGAIN TO BE SURE');
            GOTOXY( 10, 1);
            WRITE( CHR( 29));
            GOTOXY( 10, 1);
            GETPASS( PASSWD);
          UNTIL PASSWD = CHARNAME;
          CHARREC.PASSWORD := CHARNAME
        END;
        
        
      PROCEDURE CHOSRACE;  (* P010B0E *)
      
        VAR
             UNUSED : INTEGER;
             RACEI  : TRACE;
      
        BEGIN
          P010B0B;
          GOTOXY( 0, 17);
          FOR RACEI := HUMAN TO HOBBIT DO
            BEGIN
              WRITE( CHR( ORD( '@') + ORD( RACEI)));
              WRITE( ') ' );
              WRITELN( SCNTOC.RACE[ RACEI])
            END;
          REPEAT
            P010B0C;
            WRITE( 'CHOOSE A RACE >');
            GETKEY
          UNTIL (INCHAR >= 'A') AND (INCHAR <= 'E');
          GOTOXY( 10, 2);
          CHARREC.RACE := HUMAN;
          WHILE INCHAR > 'A' DO
            BEGIN
              INCHAR := PRED( INCHAR);
              CHARREC.RACE := SUCC( CHARREC.RACE)
            END;
          WRITE( SCNTOC.RACE[ CHARREC.RACE]);
          SETBASE
        END;
        
        
      PROCEDURE GIVEPTS;  (* P010B0F *)
      
        VAR
             UNUSED  : INTEGER;
             CANCHG  : BOOLEAN;
             ATTRIBX : TATTRIB;
             CLASSX  : TCLASS;
        
        
        PROCEDURE PTSMENU;  (* P010B10 *)
        
          BEGIN
            GOTOXY( 0, 15);
            WRITE( CHR( 11));
            WRITELN( 'ENTER [+,-] TO ALTER A SCORE,');
            WRITELN( '      [RET] TO GO TO NEXT SCORE,');
            WRITELN( '      [ESC] TO GO ON WHEN POINTS USED UP');
            PTSLEFT := 7 + (RANDOM MOD 4);
            WHILE (PTSLEFT < 20) AND ((RANDOM MOD 11) = 10) DO
              PTSLEFT := PTSLEFT + 10;
            SIXATTR2 := BASEATTR;
            FOR ATTRIBX := STRENGTH TO LUCK DO
              BEGIN
                GOTOXY( 10, 5 + ORD( ATTRIBX));
                WRITE( SIXATTR2[ ATTRIBX] :2)
              END;
            ATTRIBX:= STRENGTH;
            CANCHG := FALSE
          END;  (* PTSMENU *)
        
        
        BEGIN (* GIVEPTS *)
          PTSMENU;
          REPEAT
            GOTOXY( 13, 5 + ORD( ATTRIBX));
            WRITE( '<--');
            REPEAT
              GOTOXY( 10, 3);
              WRITE( PTSLEFT :2);
              GOTOXY( 41, 0);
              GETKEY;
              IF ( (INCHAR = '+') OR (INCHAR = ';') ) AND
                 (SIXATTR2[ ATTRIBX] < 18) AND
                 (PTSLEFT > 0) THEN
                 
                BEGIN
                  SIXATTR2[ ATTRIBX] := SIXATTR2[ ATTRIBX] + 1;
                  PTSLEFT := PTSLEFT - 1
                END
              ELSE
                BEGIN
                  IF ( (INCHAR = '-') OR (INCHAR = '=') ) AND
                     (SIXATTR2[ ATTRIBX] > BASEATTR[ ATTRIBX]) THEN
                     BEGIN
                       SIXATTR2[ ATTRIBX] := SIXATTR2[ ATTRIBX] - 1;
                       PTSLEFT := PTSLEFT + 1
                     END;
                END;
              IF (INCHAR = '+') OR (INCHAR = '-') OR (INCHAR = ';') OR
                 (INCHAR = '=') THEN
                BEGIN
                  GOTOXY( 10, 5 + ORD( ATTRIBX));
                  WRITE( SIXATTR2[ ATTRIBX] : 2);
                  CANCHG := GTCHGLST;
                  FOR CLASSX := FIGHTER TO NINJA DO
                    BEGIN
                      GOTOXY( 20, 5 + ORD( CLASSX));
                      IF CHG2LST[ CLASSX] THEN
                        BEGIN
                          WRITE( CHR( ORD( 'A') + ORD( CLASSX)));
                          WRITE( ') ' );
                          WRITE( SCNTOC.CLASS[ CLASSX])
                        END
                      ELSE
                        WRITE( CHR( 29))
                    END;
                END;
            UNTIL  (INCHAR = CHR( 27)) OR (INCHAR = CHR( CRETURN));
            IF INCHAR = CHR( CRETURN) THEN
              BEGIN
                GOTOXY( 13, 5 + ORD( ATTRIBX));
                WRITE( '   ');
                IF ATTRIBX < LUCK THEN
                   ATTRIBX:= SUCC( ATTRIBX)
                ELSE
                   ATTRIBX:= STRENGTH;
              END;
          UNTIL (INCHAR = CHR( 27)) AND CANCHG AND (PTSLEFT = 0);
          REPEAT
            REPEAT
              P010B0B;
              WRITE( 'CHOOSE A CLASS >');
              GETKEY
            UNTIL (INCHAR >= 'A') AND (INCHAR <= 'H');
            CLASSX := FIGHTER;
            WHILE INCHAR > 'A' DO
              BEGIN
                CLASSX := SUCC( CLASSX);
                INCHAR := PRED( INCHAR)
              END;
          UNTIL CHG2LST[ CLASSX];
          GOTOXY( 10, 13);
          WRITE( SCNTOC.CLASS[ CLASSX]);
          CHARREC.CLASS := CLASSX;
          FOR ATTRIBX := STRENGTH TO LUCK DO
            CHARREC.ATTRIB[ ATTRIBX] := SIXATTR2[ ATTRIBX]
        END;  (* GIVEPTS *)
      
      
      PROCEDURE CHOSALIG;  (* P010B11 *)
      
        VAR
             ALIGNX : TALIGN;
             
        BEGIN
          P010B0B;
          GOTOXY( 0, 17);
          FOR ALIGNX := GOOD TO EVIL DO
            BEGIN
              WRITE( CHR(  ORD( '@') + ORD( ALIGNX)));
              WRITE( ') ' );
              WRITELN( SCNTOC.ALIGN[ ALIGNX])
            END;
          REPEAT
            P010B0C;
            WRITE( 'CHOOSE AN ALIGNMENT >');
            GETKEY;
          UNTIL (INCHAR >= 'A') AND (INCHAR <= 'C');
          IF INCHAR = 'A' THEN
            CHARREC.ALIGN := GOOD
          ELSE IF INCHAR = 'B' THEN
            CHARREC.ALIGN := NEUTRAL
          ELSE
            CHARREC.ALIGN := EVIL;
          GOTOXY( 10, 12);
          WRITE( SCNTOC.ALIGN[ CHARREC.ALIGN])
        END;
        
        
      PROCEDURE KEEPCHYN;  (* P010B12 *)
      
        VAR
             VITHPMOD : INTEGER;
             CLSHPMOD : INTEGER;
             
        BEGIN
          REPEAT
            P010B0B;
            WRITE( 'KEEP THIS CHARACTER (Y/N)? >');
            GETKEY
          UNTIL (INCHAR = 'Y') OR (INCHAR = 'N');
          IF INCHAR = 'N' THEN
            EXIT( MAKECHAR);
          IF (CHARREC.CLASS = MAGE) OR (CHARREC.CLASS = BISHOP) THEN
            BEGIN
              CHARREC.SPELLSKN[ 3] := TRUE;
              CHARREC.SPELLSKN[ 1] := TRUE;
              CHARREC.MAGESP[ 1] := 2
            END;
          IF (CHARREC.CLASS = PRIEST) THEN
            BEGIN
              CHARREC.SPELLSKN[ 23] := TRUE;
              CHARREC.SPELLSKN[ 24] := TRUE;
              CHARREC.PRIESTSP[ 1] := 2
            END;
          CASE CHARREC.CLASS OF
                   FIGHTER, LORD:  CLSHPMOD := 10;
                          PRIEST:  CLSHPMOD :=  8;
            THIEF, BISHOP, NINJA:  CLSHPMOD :=  6;
                            MAGE:  CLSHPMOD :=  4;
                         SAMURAI:  CLSHPMOD := 16;
          END;
          
          VITHPMOD := 0;
          CASE CHARREC.ATTRIB[ VITALITY] OF
               3:  VITHPMOD := -2;
            4, 5:  VITHPMOD := -1;
              16:  VITHPMOD :=  1;
              17:  VITHPMOD :=  2;
              18:  VITHPMOD :=  3;
          END;
          
          CLSHPMOD := CLSHPMOD + VITHPMOD;
          FOR LLBASE04 := 1 TO 2 DO
            IF (RANDOM MOD 2) = 1 THEN
              CLSHPMOD := (9 * CLSHPMOD) DIV 10;
          IF CLSHPMOD < 2 THEN
             CLSHPMOD:= 2;
          CHARREC.HPMAX := CLSHPMOD;
          CHARREC.HPLEFT := CLSHPMOD
        END;
      
      
      BEGIN (* MAKECHAR *)
        INITCHAR;
        MAKEMENU;
        CHOSRACE;
        CHOSALIG;
        GIVEPTS;
        KEEPCHYN;
        PUTCHARC( CHARREC, CHARACX)
      END;  (* MAKECHAR *)
      
      
      
    PROCEDURE CREATE;  (* P010B13 *)
    
      VAR
           CHARRECI : INTEGER;
    
    
      PROCEDURE EXITCREA( EXITSTR : STRING);  (* P010B14 *)
      
        BEGIN
          WRITELN;
          WRITELN;
          WRITELN( EXITSTR);
          WRITELN;
          WRITELN( 'PRESS ANY KEY TO CONTINUE');
          GOTOXY( 41, 0);
          GETKEY;
          EXIT( CREATE)
        END;  (* EXITCREA *)
        
        
      BEGIN (* CREATE *)
        CHARACX := -1;
        FOR CHARRECI := 0 TO SCNTOC.RECPERDK[ ZCHAR] - 1 DO
          BEGIN
            IF CHARACX < 0 THEN
              BEGIN
              GETCHARC( CHARREC, CHARRECI);
              IF CHARREC.STATUS = LOST THEN
                CHARACX := CHARRECI
              END;
          END;
        IF CHARACX = -1 THEN
          EXITCREA( 'THERE IS NO ROOM LEFT - TRY DELETING');
        WRITELN;
        WRITELN;
        WRITELN( 'THAT CHARACTER DOES NOT EXIST. DO YOU');
        WRITE(   'WANT TO CREATE IT (Y/N) ?> ');
        REPEAT
          WRITE( CHR(8));
          GETKEY
        UNTIL (INCHAR = 'Y') OR (INCHAR = 'N');
        IF INCHAR = 'N' THEN
          EXIT( CREATE);
        MAKECHAR
      END;  (* CREATE *)
      
      
    PROCEDURE DSP20NM;  (* P010B15 *)
    
      VAR
           UNUSED  : INTEGER;
           LINECNT : INTEGER;
           CHARI   : INTEGER;
    
      BEGIN
        WRITE( CHR( 12));
        WRITELN( 'NAMES IN USE:');
        WRITELN( '----------------------------------------');
        LINECNT := 0;
        FOR CHARI := 0 TO SCNTOC.RECPERDK[ ZCHAR] - 1 DO
          BEGIN
            GETCHARC( CHARREC, CHARI);
            IF CHARREC.STATUS <> LOST THEN
              BEGIN
                LINECNT := LINECNT + 1;
                GOTOXY( 0, LINECNT + 1);
                WRITE( CHARREC.NAME);
                WRITE( ' LEVEL ');
                WRITE( CHARREC.CHARLEV);
                WRITE( ' ');
                WRITE( SCNTOC.RACE[ CHARREC.RACE]);
                WRITE( ' ');
                WRITE( SCNTOC.CLASS[ CHARREC.CLASS]);
                WRITE( ' (' );
                WRITE( SCNTOC.STATUS[ CHARREC.STATUS]);
                WRITE( ')' );
                IF CHARREC.INMAZE OR (CHARREC.LOSTXYL.LOCATION[ 1] <> 0) THEN
                  WRITE( ' OUT');
              END;
          END;
          
        GOTOXY( 0, 22);
        WRITELN( '----------------------------------------');
        WRITE( 'YOU MAY L)EAVE WHEN READY');
        REPEAT
          GOTOXY( 41, 0);
          GETKEY
        UNTIL INCHAR = 'L';
        INCHAR := CHR( 0)
      END;
      
      
    PROCEDURE TRAINING;  (* P010B16 *)
    
    VAR
         
         PASSSTR  : STRING;
    
    
      PROCEDURE LOSECHAR;  (* P010B17 *)
      
        BEGIN
          CHARREC.STATUS := LOST;
          CHARREC.INMAZE := FALSE;
          PUTCHARC( CHARREC, CHARACX);
          GTSCNTOC
        END;
        
        
      PROCEDURE INSPECT;  (* P010B18 *)
      
        BEGIN
          PARTYCNT := 1;
          CHARACTR[ 0] := CHARREC;
          CHARDISK[ 0] := CHARACX;
          XGOTO := XINSPCT3;
          EXIT( ROLLER)
        END;
        
        
      PROCEDURE RUSUREYN( DELSTR: STRING);  (* P010B19 *)
      
        BEGIN
          REPEAT
            WRITE( CHR(12));
            WRITE( 'ARE YOU SURE YOU WANT TO ');
            WRITE( DELSTR);
            WRITE( ' (Y/N) ?' );
            GETKEY
          UNTIL (INCHAR = 'Y') OR (INCHAR = 'N')
        END;
        
        
      PROCEDURE DELCHAR;  (* P010B1A *)
      
        BEGIN
          RUSUREYN( 'DELETE');
          IF INCHAR = 'N' THEN
            EXIT( DELCHAR);
          LOSECHAR;
          EXIT( TRAINING)
        END;
        
        
      PROCEDURE CHGCLASS;  (* P010B1B *)
      
        VAR
             ATTRIBI  : TATTRIB;
             CHGLSTX  : BOOLEAN;  (* NOT USED *)
             CLASSX   : TCLASS;
      
        BEGIN  (* CHGCLASS *)
          GOTOXY( 0, 2);
          WRITELN( CHR( 11));
          FOR ATTRIBI := STRENGTH TO LUCK DO
            SIXATTR2[ ATTRIBI] := CHARREC.ATTRIB[ ATTRIBI];
          CHGLSTX := GTCHGLST;
          
          FOR CLASSX := FIGHTER TO NINJA DO
            IF CHG2LST[ CLASSX] AND
               NOT ( CLASSX = CHARREC.CLASS) THEN
              BEGIN
                WRITE( CHR( ORD('A') + ORD( CLASSX)));
                WRITE( ') ');
                WRITELN( SCNTOC.CLASS[ CLASSX]);
              END;
          WRITELN;
          WRITELN( 'PRESS [LETTER] TO CHANGE CLASS');
          WRITELN( '[RET] TO NOT CHANGE CLASS' : 34);
          REPEAT
            REPEAT
              GOTOXY( 41, 0);
              GETKEY
            UNTIL (INCHAR = CHR( CRETURN)) OR
                   ((ORD( INCHAR) >= ORD( 'A')) AND
                    (ORD( INCHAR) <= ORD( 'H')));
            IF INCHAR = CHR( CRETURN) THEN
              EXIT( CHGCLASS);
            CLASSX := FIGHTER;
            WHILE INCHAR > 'A' DO
              BEGIN
                CLASSX := SUCC( CLASSX);
                INCHAR := PRED( INCHAR)
              END;
          UNTIL CHG2LST[ CLASSX] AND ( NOT( CLASSX = CHARREC.CLASS));
          
          SETBASE;
          FOR ATTRIBI := STRENGTH TO LUCK DO
            CHARREC.ATTRIB[ ATTRIBI] := BASEATTR[ ATTRIBI];
          CHARREC.CLASS := CLASSX;
          CHARREC.CHARLEV := 1;
          CHARREC.EXP.HIGH := 0;
          CHARREC.EXP.MID  := 0;
          CHARREC.EXP.LOW  := 0;
          CHARREC.AGE := CHARREC.AGE + 52 * (RANDOM MOD 3) + 252;
          IF CLASSX = MAGE THEN
            CHARREC.SPELLSKN[ 3] := TRUE
          ELSE IF CLASSX = PRIEST THEN
            CHARREC.SPELLSKN[ 23] := TRUE;
          FOR TEMPX := 1 TO 7 DO
            BEGIN
              CHARREC.MAGESP[   TEMPX] := 0;
              CHARREC.PRIESTSP[ TEMPX] := 0
            END;
          FOR TEMPX := 1 TO CHARREC.POSS.POSSCNT DO
            IF NOT CHARREC.POSS.POSSESS[ TEMPX].CURSED THEN
              CHARREC.POSS.POSSESS[ TEMPX].EQUIPED := FALSE;
          PUTCHARC( CHARREC, CHARACX);
          GTSCNTOC
        END;  (* CHGCLASS *)
        

      PROCEDURE CHGPASS;  (* P010B1C *)
      
        VAR
             NEWPASS2 : STRING[ 40];
             NEWPASS1 : STRING[ 40];
      
        BEGIN;
          WRITE( CHR(12));
          WRITE( 'ENTER NEW PASSWORD ([RET] FOR NONE)');
          REPEAT
            GOTOXY( 10, 2);
            GETPASS(  NEWPASS1)
          UNTIL LENGTH( NEWPASS1) <= 15;
          WRITE( CHR( 12));
          WRITE( 'ENTER AGAIN TO BE SURE');
          REPEAT
            GOTOXY( 10, 2);
            GETPASS( NEWPASS2)
          UNTIL LENGTH( NEWPASS2) <= 15;
          WRITE( CHR( 12));
          IF NEWPASS1 = NEWPASS2 THEN
            BEGIN
              CHARREC.PASSWORD := NEWPASS1;
              PUTCHARC( CHARREC, CHARACX);
              GTSCNTOC;
              WRITE( 'PASSWORD CHANGED - ')
            END
          ELSE
            BEGIN
              WRITELN( 'THEY ARE NOT THE SAME - YOUR PASSWORD');
              WRITELN( 'HAS NOT BEEN CHANGED!');
              WRITELN
            END;
          WRITE( 'PRESS [RET]');
          GOTOXY( 41, 0);
          READLN
        END;

        
      BEGIN  (* TRAINING *)
        PARTYCNT := 0;
        IF XGOTO <> XBCK2ROL THEN
          BEGIN
            REPEAT
              GOTOXY( 9, 10);
              WRITE( 'PASSWORD >');
              GETPASS( PASSSTR)
            UNTIL LENGTH( PASSSTR) <= 15;
            IF PASSSTR <> CHARREC.PASSWORD THEN
              EXIT( TRAINING)
          END
        ELSE
          BEGIN
            XGOTO := XTRAININ;
            CHARREC := CHARACTR[ 0];
            CHARACX := CHARDISK[ 0]
          END;
        
        REPEAT
          WRITE( CHR( 12));
          WRITE( CHARREC.NAME);
          WRITE( ' LEVEL ');
          WRITE( CHARREC.CHARLEV);
          WRITE( ' ');
          WRITE( SCNTOC.RACE[ CHARREC.RACE]);
          WRITE( ' ');
          WRITE( SCNTOC.CLASS[ CHARREC.CLASS]);
          WRITE( ' (' );
          WRITE( SCNTOC.STATUS[ CHARREC.STATUS]);
          WRITELN( ')' );
          WRITELN;
          
          WRITELN( 'YOU MAY I)NSPECT THIS CHARACTER,');
          WRITELN( 'D)ELETE  THIS CHARACTER,' : 32);
          WRITELN( 'R)EROLL  THIS CHARACTER,' : 32);
          WRITELN( 'C)HANGE  CLASS,' : 23);
          WRITELN( 'S)ET NEW PASSWORD, OR' : 29);
          WRITELN( '  PRESS [RET] TO LEAVE');
          
          GOTOXY( 41, 0);
          GETKEY;
          IF INCHAR = CHR( CRETURN) THEN
            EXIT( TRAINING);
          CASE INCHAR OF
            'I':  INSPECT;
            'D':  DELCHAR;
            'C':  CHGCLASS;
            'R':  BEGIN
                    RUSUREYN( 'REROLL');
                    IF INCHAR = 'Y' THEN
                      BEGIN
                        CHARNAME := CHARREC.NAME;
                        LOSECHAR;
                        MAKECHAR
                      END;
                  END;
            'S':  CHGPASS;
          END;  
          
        UNTIL FALSE
      END;   (* TRAINING *)
      
      
    BEGIN  (* P010B01  ROLLER *)
      IF XGOTO = XBCK2ROL THEN
        TRAINING;
      REPEAT
        WRITE( CHR( 12));
        WRITE(   ' ' :12);
        WRITELN( 'TRAINING GROUNDS');
        WRITELN;
        WRITELN( 'YOU MAY ENTER A CHARACTER NAME TO ADD,');
        WRITE(   ' ' :8);
        WRITELN( 'INSPECT OR EDIT,');
        WRITELN;
        WRITE(   ' ' :8);
        WRITELN( '"*ROSTER" TO SEE ROSTER,');
        WRITELN;
        WRITELN( 'OR PRESS [RET] FOR CASTLE.' : 33);
        REPEAT
          GOTOXY( 13, 9);
          WRITE( CHR( 11));
          WRITE( 'NAME >');
          GETLINE( CHARNAME);
          IF  CHARNAME = '' THEN
            BEGIN
              WRITE( CHR( 12));
              XGOTO := XCASTLE;
              EXIT( ROLLER)
            END;
        UNTIL LENGTH( CHARNAME) <= 15;
        
        IF CHARNAME = '*ROSTER' THEN
          DSP20NM
        ELSE
          BEGIN
            CHARACX := -1;
            FOR TEMPX := 0 TO SCNTOC.RECPERDK[ ZCHAR] - 1 DO
              IF CHARACX < 0 THEN
                BEGIN
                  GETCHARC( CHARREC, TEMPX);
                  IF CHARREC.STATUS <> LOST THEN
                    IF CHARREC.NAME = CHARNAME THEN
                      CHARACX := TEMPX
                END;
            IF CHARACX < 0 THEN
              CREATE
            ELSE
              TRAINING
          END
      UNTIL FALSE
    END;   (* ROLLER *)
  

(* ========================================================================== *)
(* DISK: Wiz1C.DSK | FILE: CAMP.TEXT                                   *)
(* ========================================================================== *)

SEGMENT PROCEDURE CAMP;  (* P010C01 *)

    VAR
         OBJIDS   : ARRAY[ 0..7] OF INTEGER;
         OBJNAMES : ARRAY[ 0..7] OF ARRAY[ FALSE..TRUE] OF STRING[ 15];
         CURSEDXX : PACKED ARRAY[ 0..7] OF BOOLEAN;
         CANUSE   : PACKED ARRAY[ 0..7] OF BOOLEAN;
         DISPSTAT : BOOLEAN;
         OBJI     : INTEGER;
         
    
    PROCEDURE AASTRAA( ASTRA: STRING);  (* P010C02 *)
    
      BEGIN
        CENTSTR( CONCAT( '** ', ASTRA, ' **'));
      END;
      
      
    PROCEDURE INSPECT;  (* P010C03 *)
    
      VAR
           UNUSEDXX : INTEGER;
           CAMPCHAR : INTEGER;
         
         
      PROCEDURE DSPSPELS;  (* P010C04 *)
      
        VAR
             INDX : INTEGER;
      
        BEGIN
          WITH CHARACTR[ CAMPCHAR] DO
            BEGIN
              GOTOXY(  0, 9);
              WRITE( ' ' : 7);
              WRITE( ' MAGE ');
              FOR INDX := 1 TO 7 DO
                BEGIN
                  WRITE( MAGESP[ INDX]);
                  IF INDX < 7 THEN
                    WRITE( '/')
                END;
              WRITELN;
              WRITE( ' ' :6);
              WRITE( 'PRIEST ');
              FOR INDX := 1 TO 7 DO
                BEGIN
                  WRITE( PRIESTSP[ INDX]);
                  IF INDX < 7 THEN
                    WRITE( '/')
                END
            END
        END;
        
        
      PROCEDURE DSPITEMS;  (* P010C05 *)
      
      VAR
           ITEMX   : INTEGER;
           OBJECT  : TOBJREC;
           
        BEGIN
          GOTOXY( 0, 12);
          WRITE( '*=EQUIP, -=CURSED, ?=UNKNOWN, #=UNUSABLE');
          FOR ITEMX := 14 TO 17 DO
            BEGIN
              GOTOXY( 0, ITEMX);
              WRITE( CHR( 29))
            END;
            
          WITH CHARACTR[ CAMPCHAR] DO
            BEGIN
              IF POSS.POSSCNT = 0 THEN
                EXIT( DSPITEMS);
            
              FOR ITEMX := 1 TO POSS.POSSCNT DO
                BEGIN
                  GOTOXY( 20 -  20 * (ITEMX MOD 2),
                          14 + ((ITEMX - 1) DIV 2) );
                  IF OBJIDS[ ITEMX - 1] <>
                       POSS.POSSESS[ ITEMX].EQINDEX  THEN
                    BEGIN
                      MOVELEFT( IOCACHE[ GETREC(
                                   ZOBJECT,
                                   POSS.POSSESS[ ITEMX].EQINDEX,
                                   SIZEOF( TOBJREC))],
                                OBJECT,
                                SIZEOF( TOBJREC));
                      OBJIDS[ ITEMX - 1] := POSS.POSSESS[ ITEMX].EQINDEX;
                      OBJNAMES[ ITEMX - 1][ TRUE]  := OBJECT.NAME;
                      OBJNAMES[ ITEMX - 1][ FALSE] := OBJECT.NAMEUNK;
                      CANUSE[ ITEMX - 1] := OBJECT.CLASSUSE[ CLASS];
                      CURSEDXX[ ITEMX - 1] := OBJECT.CURSED
                    END;
                    
                  WRITE( ITEMX :1);
                  WRITE( ')');
                  IF POSS.POSSESS[ ITEMX].EQUIPED THEN
                    IF CURSEDXX[ ITEMX - 1] THEN
                      WRITE( '-')
                    ELSE
                      WRITE( '*')
                  ELSE
                    IF POSS.POSSESS[ ITEMX].IDENTIF THEN
                      IF CANUSE[ ITEMX - 1] THEN
                        WRITE( ' ')
                      ELSE
                        WRITE( '#')  (* WAS '^' IN LOL *)
                    ELSE
                      WRITE( '?');
                  WRITE( OBJNAMES[ ITEMX - 1][ POSS.POSSESS[ ITEMX].IDENTIF])
                END
            END
        END;
        
        
      PROCEDURE CASTSPEL( SPELHASH: INTEGER);  (* P010C06 *)
        
        CONST

              HALITO   =  4178;
              MOGREF   =  2409;
              KATINO   =  3983;
              DUMAPIC  =  3245;
              
              DILTO    =  3340;
              SOPIC    =  1953;
              
              MAHALITO =  6181;
              MOLITO   =  4731;
              
              MORLIS   =  4744;
              DALTO    =  3180;
              LAHALITO =  6156;
              
              MAMORLIS =  7525;
              MAKANITO =  6612;
              MADALTO  =  4925;
              
              LAKANITO =  6587;
              ZILWAN   =  4573;
              MASOPIC  =  3990;
              HAMAN    =  1562;
              
              MALOR    =  3128;
              MAHAMAN  =  2597;
              TILTOWAI = 11157;
              
              
              KALKI    =  1449;
              DIOS     =  2301;
              BADIOS   =  3675;
              MILWA    =  2889;
              PORFIC   =  2287;
              
              MATU     =  3139;
              CALFO    =     0; (* 1717 *)
              MANIFO   =  2619;
              MONTINO  =  5970;
              
              LOMILWA  =  5333;
              DIALKO   =  2718;
              LATUMAPI =  6491;
              BAMATU   =  5169;
              
              DIAL     =   761;
              BADIAL   =  1253;
              LATUMOFI =  9463;
              MAPORFIC =  4322;
              
              DIALMA   =  1614;
              BADIALMA =  2446;
              LITOKAN  =  4396;
              KANDI    =  1185; (* 1885 *)
              DI       =   180;
              BADI     =   382;
              
              LORTO    =  4296;
              MADI     =   547;
              MABADI   =   759;
              LOKTOFEI =  8330;
              
              MALIKTO  =  5514;
              KADORTO  =  6673;
        
        VAR
             USEITEM  : BOOLEAN;
             SPELNAME : STRING;
             UNUSEDXX : INTEGER;
             HASHCALC : INTEGER;
             SPELLI   : INTEGER;
             HEALME   : INTEGER;
      
      
        PROCEDURE EXITCAST( EXITSTR: STRING);  (* P010C07 *)
        
          BEGIN
            AASTRAA( EXITSTR);
            DSPSPELS;
            EXIT( CASTSPEL)
          END;
          
          
        PROCEDURE HEALWHO;  (* P010C08 *)
        
          VAR
               UNUSED : ARRAY[ 0..41] OF INTEGER;
        
          BEGIN
            HEALME := GETCHARX( TRUE, 'CAST ON WHO');
            IF HEALME = -1 THEN
              EXITCAST( 'NOT IN THE PARTY')
          END;
          
          
        PROCEDURE CHKSPCNT( PRIESTGR: INTEGER; (* P010C09 *)
                            SPELLIDX: INTEGER);
        
          BEGIN
            IF USEITEM THEN
              EXIT( CHKSPCNT);
            IF (CHARACTR[ CAMPCHAR].PRIESTSP[ PRIESTGR] <= 0) OR
               (NOT CHARACTR[ CAMPCHAR].SPELLSKN[ SPELLIDX]) THEN
              EXITCAST( 'YOU CANT CAST IT')
          END;
          
          
        PROCEDURE DECPRIEST( PRIESTGR: INTEGER);  (* P010C0A *)
        
          BEGIN
            IF NOT USEITEM THEN
              CHARACTR[ CAMPCHAR].PRIESTSP[ PRIESTGR] :=
                CHARACTR[ CAMPCHAR].PRIESTSP[ PRIESTGR] - 1;
            IF FIZZLES > 0 THEN
              EXITCAST( 'SPELL HAS NO EFFECT')
          END;
          
          
        PROCEDURE DOHEAL( HPTRIES:  INTEGER;  (* P010C0B *)
                          MAXHPTRY: INTEGER;
                          PRIESTGR: INTEGER;
                          SPELLIDX: INTEGER);
        
          VAR
               HPHEALED : INTEGER;
        
          BEGIN
            CHKSPCNT( PRIESTGR, SPELLIDX);
            HEALWHO;
            DECPRIEST( PRIESTGR);
            HPHEALED := 0;
            IF HPTRIES = -1 THEN
              BEGIN
                  (* MADI *)
                HPHEALED := CHARACTR[ HEALME].HPMAX;
                CHARACTR[ HEALME].LOSTXYL.POISNAMT[ 1] := 0;
                IF CHARACTR[ HEALME].STATUS < DEAD THEN
                  CHARACTR[ HEALME].STATUS := OK
              END
            ELSE
              WHILE HPTRIES > 0 DO
                BEGIN
                  HPHEALED := HPHEALED + (RANDOM MOD MAXHPTRY) + 1;
                  HPTRIES := HPTRIES - 1
                END;
            CHARACTR[ HEALME].HPLEFT := CHARACTR[ HEALME].HPLEFT + HPHEALED;
            IF CHARACTR[ HEALME].HPLEFT > CHARACTR[ HEALME].HPMAX THEN
              CHARACTR[ HEALME].HPLEFT := CHARACTR[ HEALME].HPMAX;
            GOTOXY( 0, 23);
            WRITE( 'CURED ');
            WRITE( HPHEALED);
            WRITE( ' HP - NOW ');
            WRITE( CHARACTR[ HEALME].HPLEFT);
            WRITE( '/');
            WRITE( CHARACTR[ HEALME].HPMAX);
            GOTOXY( 41, 0);
            PAUSE2;
            DSPSPELS;
            EXIT( CASTSPEL)
          END;  (* DOHEAL *)
          
          
        PROCEDURE DOKANDI;  (* P010C0C *)
        
          BEGIN
            CHKSPCNT( 5, 42);
            DECPRIEST( 5);
            DISPSTAT := TRUE;
            LLBASE04 := CAMPCHAR;
            BASE12.GOTOX := XCASTLE;
            XGOTO := XCAMPSTF;
            EXIT( CAMP)
          END;
          
          
        PROCEDURE DODIKADO( DIKADOXX: INTEGER);  (* P010C0D *)
        
        
          PROCEDURE DIKADORT;  (* P010C0E *)
          
            BEGIN
              IF (RANDOM MOD 100) <=
                 4 * CHARACTR[ HEALME].ATTRIB[ VITALITY] THEN
                BEGIN
                  CHARACTR[ HEALME].STATUS := OK;
                  IF DIKADOXX = 5 THEN
                    CHARACTR[ HEALME].HPLEFT := 1
                  ELSE
                    CHARACTR[ HEALME].HPLEFT := 
                      CHARACTR[ HEALME].HPMAX;
                  IF CHARACTR[ HEALME].ATTRIB[ VITALITY] = 3 THEN
                    CHARACTR[ HEALME].STATUS := LOST
                  ELSE
                    CHARACTR[ HEALME].ATTRIB[ VITALITY] :=
                      CHARACTR[ HEALME].ATTRIB[ VITALITY] - 1
                END;
              IF CHARACTR[ HEALME].STATUS = OK THEN
                EXITCAST( 'EXCELSIOR')
              ELSE
                BEGIN
                  CHARACTR[ HEALME].STATUS := SUCC( CHARACTR[ HEALME].STATUS);
                  EXITCAST( 'OOPPS!')
                END
            END;  (* DIKADORT *)
            
            
          BEGIN  (* DODIKADO *)
            IF DIKADOXX = 5 THEN
              CHKSPCNT( DIKADOXX, 43)
            ELSE
              CHKSPCNT( DIKADOXX, 50);
            HEALWHO;
            DECPRIEST( DIKADOXX);
            IF DIKADOXX = 5 THEN
              BEGIN
                IF CHARACTR[ HEALME].STATUS = DEAD THEN
                  DIKADORT
                ELSE
                  IF CHARACTR[ HEALME].STATUS = ASHES THEN
                    EXITCAST( '"KADORTO" NEEDED')
              END
            ELSE
              IF (CHARACTR[ HEALME].STATUS = DEAD) OR
                 (CHARACTR[ HEALME].STATUS = ASHES) THEN
                DIKADORT
              ELSE
                IF CHARACTR[ HEALME].STATUS = LOST THEN
                  EXITCAST( 'LOST');
            EXITCAST( 'NOT DEAD')
          END;  (* DODIKADO *)
          
          
        PROCEDURE DODUMAPI;  (* P010C0F *)
        
          BEGIN
            IF NOT (USEITEM) THEN
              IF (CHARACTR[ CAMPCHAR].MAGESP[ 1] = 0) OR
                 NOT CHARACTR[ CAMPCHAR].SPELLSKN[ 4] THEN
                EXITCAST( 'YOU CANT CAST IT');
            IF FIZZLES > 0 THEN
              EXITCAST( 'SPELL FAILS');
            IF NOT USEITEM THEN
              CHARACTR[ CAMPCHAR].MAGESP[ 1] :=
                CHARACTR[ CAMPCHAR].MAGESP[ 1] - 1;
            LLBASE04 := CAMPCHAR;
            BASE12.GOTOX := XGILGAMS;
            XGOTO := XCAMPSTF;
            EXIT( CAMP)
          END;  (* DODUMAPI *)
          
          
        PROCEDURE DOMALOR;  (* P010C10 *)
        
          BEGIN
            IF NOT USEITEM THEN
              IF (CHARACTR[ CAMPCHAR].MAGESP[ 7] = 0) OR
                 (NOT CHARACTR[ CAMPCHAR].SPELLSKN[ 19]) THEN
                EXITCAST( 'YOU CANT CAST IT');
            IF FIZZLES > 0 THEN
              EXITCAST( 'SPELL FAILS');
            IF NOT USEITEM THEN
              CHARACTR[ CAMPCHAR].MAGESP[ 7] :=
                CHARACTR[ CAMPCHAR].MAGESP[ 7] - 1;
            LLBASE04 := CAMPCHAR;
            BASE12.GOTOX := XINSPECT;
            XGOTO := XCAMPSTF;
            EXIT( CAMP)
          END;  (* DOMALOR *)
          
          
        BEGIN (* CASTSPEL *)
          DISPSTAT := FALSE;
          USEITEM := SPELHASH > 0;
          IF SPELHASH = -1 THEN
            BEGIN
              GOTOXY( 0, 18);
              WRITE( CHR( 11));
              WRITE( 'WHAT SPELL ? >' : 24);
              GETLINE( SPELNAME);
              SPELHASH := LENGTH( SPELNAME);
              FOR SPELLI := 1 TO LENGTH( SPELNAME) DO
                BEGIN
                  HASHCALC := ORD( SPELNAME[ SPELLI]) - 64;
                  SPELHASH := SPELHASH + HASHCALC * HASHCALC * SPELLI
                END;
            END;
            
          GOTOXY( 41, 0);
          WRITE( SPELHASH : 6);
          WRITE( ' ');
          
          IF SPELHASH = DIOS THEN
            DOHEAL( 1, 8, 1, 23)
          ELSE IF SPELHASH = MILWA THEN
            BEGIN
              CHKSPCNT( 1, 25);
              DECPRIEST( 1);
              LIGHT := 15 + (RANDOM MOD 15)
            END
          ELSE IF SPELHASH = DUMAPIC THEN
            DODUMAPI
          ELSE IF SPELHASH = KANDI THEN
            DOKANDI
          ELSE IF SPELHASH = LOMILWA THEN
            BEGIN
              CHKSPCNT( 3, 31);
              DECPRIEST( 3);
              LIGHT := 32000
            END
          ELSE IF SPELHASH = LATUMOFI THEN
            BEGIN
              CHKSPCNT( 4, 37);
              HEALWHO;
              DECPRIEST( 4);
              CHARACTR[ HEALME].LOSTXYL.POISNAMT[ 1] := 0
            END
          ELSE IF SPELHASH = DIALKO THEN
            BEGIN
              CHKSPCNT( 3, 32);
              HEALWHO;
              DECPRIEST( 3);
              IF (CHARACTR[ HEALME].STATUS = PLYZE) OR
                 (CHARACTR[ HEALME].STATUS = ASLEEP) THEN
                CHARACTR[ HEALME].STATUS := OK;
            END
          ELSE IF SPELHASH = DIAL THEN
            DOHEAL( 2, 8, 4, 35)
          ELSE IF SPELHASH = MAPORFIC THEN
            BEGIN
              CHKSPCNT( 4, 38);
              DECPRIEST( 4);
              ACMOD2 := 2
            END
          ELSE IF SPELHASH = DIALMA THEN
            DOHEAL( 3, 8, 5, 39)
          ELSE IF SPELHASH = DI THEN
            DODIKADO( 5)
          ELSE IF SPELHASH = MADI THEN
            DOHEAL( -1, -1, 6, 46)
          ELSE IF SPELHASH = KADORTO THEN
            DODIKADO( 7)
          ELSE IF SPELHASH = MALOR THEN
            DOMALOR
          ELSE
            EXITCAST( 'WHAT?');
          EXITCAST( 'DONE!')
        END;  (* CASTSPEL *)
        
        
      PROCEDURE USEITEM;  (* P010C11 *)
        
        VAR
             THEITEM  : TOBJREC;
             UNUSEDXX : INTEGER;
             UNUSEDYY : INTEGER;
             UNUSEDZZ : INTEGER;
             ITEMX    : INTEGER;
             
             
        PROCEDURE EXITUSE( EXITSTR: STRING);  (* P010C12 *)
        
          BEGIN
            AASTRAA( EXITSTR);
            EXIT( USEITEM)
          END;
          
          
        BEGIN (* USEITEM *)
          DISPSTAT := FALSE;
          REPEAT
            GOTOXY( 0, 18);
            WRITE( CHR( 11));
            WRITE( 'USE ITEM (0=EXIT) ? >');
            GETKEY;
            WRITELN;
            ITEMX := ORD( INCHAR) - ORD( '0');
            IF ITEMX = 0 THEN
              EXIT( USEITEM);
          UNTIL (ITEMX > 0) AND
                (ITEMX <= CHARACTR[ CAMPCHAR].POSS.POSSCNT);
          MOVELEFT( IOCACHE[ GETREC(
                       ZOBJECT,
                       CHARACTR[ CAMPCHAR].POSS.POSSESS[ ITEMX].EQINDEX,
                       SIZEOF( TOBJREC))],
                    THEITEM,
                    SIZEOF( TOBJREC));
          IF THEITEM.SPELLPWR = 0 THEN
            EXITUSE( 'POWERLESS');
          IF THEITEM.OBJTYPE <> SPECIAL THEN
            IF NOT CHARACTR[ CAMPCHAR].POSS.POSSESS[ ITEMX].EQUIPED THEN
              EXITUSE( 'NOT EQUIPPED');
          IF (RANDOM MOD 100) < THEITEM.CHGCHANC THEN
            CHARACTR[ CAMPCHAR].POSS.POSSESS[ ITEMX].EQINDEX := 
              THEITEM.CHANGETO;
          CASTSPEL( SCNTOC.SPELLHSH[ THEITEM.SPELLPWR])
        END;  (* USEITEM *)
        
        

      
  PROCEDURE DROPITEM;  (* P010C13 *)
      
      VAR
           UNUSEDXX : INTEGER;
           UNUSEDYY : INTEGER;
           POSSX    : INTEGER;
           POSSI    : INTEGER;
        
        
        PROCEDURE EXITDROP( EXITSTR: STRING);  (* P010C14 *)
        
          BEGIN
            AASTRAA( EXITSTR);
            EXIT( DROPITEM)
          END;
          
          
        BEGIN  (* DROPITEM *)
          DISPSTAT := FALSE;
          REPEAT
            GOTOXY( 0, 18);
            WRITE( CHR( 11));
            WRITE(  'DROP ITEM (0=EXIT) ? >');
            GETKEY;
            POSSI := ORD( INCHAR) - ORD( '0');
            IF POSSI = 0 THEN
              EXIT( DROPITEM);
          UNTIL (POSSI > 0) AND
                (POSSI <= CHARACTR[ CAMPCHAR].POSS.POSSCNT);
          IF CHARACTR[ CAMPCHAR].POSS.POSSESS[ POSSI].CURSED THEN
            EXITDROP( 'CURSED');
          IF CHARACTR[ CAMPCHAR].POSS.POSSESS[ POSSI].EQUIPED THEN
            EXITDROP( 'EQUIPPED');
          FOR POSSX := POSSI + 1 TO CHARACTR[ CAMPCHAR].POSS.POSSCNT DO
            CHARACTR[ CAMPCHAR].POSS.POSSESS[ POSSX - 1] :=
              CHARACTR[ CAMPCHAR].POSS.POSSESS[ POSSX];
          CHARACTR[ CAMPCHAR].POSS.POSSCNT :=
                                          CHARACTR[ CAMPCHAR].POSS.POSSCNT - 1;
          DSPITEMS;
          EXITDROP( 'DROPPED')
        END;  (* DROPITEM *)
        

(* ========================================================================== *)
(* DISK: Wiz1C.DSK | FILE: CAMP2.TEXT                                  *)
(* ========================================================================== *)

      
    PROCEDURE IDENTIFY;  (* P010C15 *)
      
        VAR
             UNUSEDXX : INTEGER;
             
             
      PROCEDURE EXITIDNT( EXITSTR: STRING);  (* P010C16 *)
        
          BEGIN
            AASTRAA( EXITSTR);
            EXIT( IDENTIFY)
          END;
          
          
        BEGIN (* IDENTIFY *)
          DISPSTAT := FALSE;
          IF CHARACTR[ CAMPCHAR].CLASS <> BISHOP THEN
              EXITIDNT( 'NOT BISHOP');
          LLBASE04 := CAMPCHAR;
          BASE12.GOTOX := XTRAININ;
          XGOTO := XCAMPSTF;
          EXIT( CAMP)
        END;  (* IDENTIFY *)
        
        
      PROCEDURE DOTRADE;  (* P010C17 *)
      
        VAR
             GOLD2TRA : TWIZLONG;
             TRADETO  : INTEGER;
             GOLDSTR  : STRING;
             GOLDX    : INTEGER;
             TEMP0001 : INTEGER; (* MULTIPLE USES *)
             ITEMX    : INTEGER;
             
             
        PROCEDURE EXITTRAD( EXITSTR: STRING);  (* P010C18 *)
        
          BEGIN
            AASTRAA( EXITSTR);
            EXIT( DOTRADE)
          END;
          
          
        PROCEDURE TRADGOLD;  (* P010C19 *)
        
          VAR
               TEMPGOLD : TWIZLONG;
               MULT10   : INTEGER;
        
          BEGIN
            GOTOXY( 0, 18);
            WRITE( CHR( 11));
            WRITE( 'AMT OF GOLD ? >');
            GETLINE( GOLDSTR);
            FILLCHAR( TEMPGOLD, 6, 0);
            FILLCHAR( GOLD2TRA, 6, 0);
            TEMP0001 := 0;
            MULT10 := 10;
            FOR GOLDX := 1 TO LENGTH( GOLDSTR) DO
              IF (ORD( GOLDSTR[ GOLDX]) < ORD( '0')) OR
                 (ORD( GOLDSTR[ GOLDX]) > ORD( '9')) OR
                 (GOLDX > 12) OR
                 (TEMP0001 = -1)    THEN
                TEMP0001 := -1
              ELSE
                BEGIN
                  MULTLONG( GOLD2TRA, MULT10);
                  TEMPGOLD.LOW := ORD( GOLDSTR[ GOLDX]) - ORD( '0');
                  ADDLONGS( GOLD2TRA, TEMPGOLD)
                END;
            IF TEMP0001 = -1 THEN
              EXITTRAD( 'BAD AMT');
            IF TESTLONG( CHARACTR[ CAMPCHAR].GOLD, GOLD2TRA) < 0 THEN
              EXITTRAD( 'NOT ENOUGH $');
            ADDLONGS( CHARACTR[ TRADETO].GOLD, GOLD2TRA);
            SUBLONGS( CHARACTR[ CAMPCHAR].GOLD, GOLD2TRA)
          END;  (* TRADGOLD *)
          
          
        PROCEDURE TRADITEM;  (* P010C1A *)
        
          BEGIN
            REPEAT
              REPEAT
                GOTOXY( 0, 18);
                WRITE( CHR( 11));
                WRITE( 'WHAT ITEM ([RET] EXITS) ? >');
                GETKEY;
                ITEMX := ORD( INCHAR) - ORD( '0');
                IF INCHAR = CHR( CRETURN) THEN
                  EXIT( DOTRADE)
              UNTIL (ITEMX > 0) AND
                    (ITEMX <= CHARACTR[ CAMPCHAR].POSS.POSSCNT);
              IF CHARACTR[ TRADETO].POSS.POSSCNT = 8 THEN
                EXITTRAD( 'FULL');
              IF CHARACTR[ CAMPCHAR].POSS.POSSESS[ ITEMX].CURSED THEN
                EXITTRAD( 'CURSED');
              IF CHARACTR[ CAMPCHAR].POSS.POSSESS[ ITEMX].EQUIPED THEN
                EXITTRAD( 'EQUIPPED');
              TEMP0001 := CHARACTR[ TRADETO].POSS.POSSCNT + 1;
              CHARACTR[ TRADETO].POSS.POSSESS[ TEMP0001] :=
                CHARACTR[ CAMPCHAR].POSS.POSSESS[ ITEMX];
              CHARACTR[ TRADETO].POSS.POSSCNT := TEMP0001;
              FOR TEMP0001 := ITEMX + 1 TO CHARACTR[ CAMPCHAR].POSS.POSSCNT DO
                CHARACTR[ CAMPCHAR].POSS.POSSESS[ TEMP0001 - 1] :=
                  CHARACTR[ CAMPCHAR].POSS.POSSESS[ TEMP0001];
              CHARACTR[ CAMPCHAR].POSS.POSSCNT :=
                                          CHARACTR[ CAMPCHAR].POSS.POSSCNT - 1;
              DSPITEMS
            UNTIL FALSE
          END;  (* TRADITEM *)
      
      
        BEGIN (* DOTRADE *)
          DISPSTAT := FALSE;
          REPEAT
            TRADETO := GETCHARX( TRUE, 'TRADE WITH');
            IF TRADETO = -1 THEN
              EXIT( DOTRADE);
          UNTIL TRADETO <> CAMPCHAR;
          TRADGOLD;
          TRADITEM
        END;  (* DOTRADE *)
        
        
      PROCEDURE CAMPDO;  (* P010C1B *)
      
        VAR
             MENUTYPE : INTEGER;
      
      
        PROCEDURE CAMPMENU;  (* P010C1C *)
        
        
          PROCEDURE DSPSTATS;  (* P010C1D *)


            PROCEDURE CHEVRONS;  (* P010C1E *)
      
              VAR
                   INDX     : INTEGER;
                   LOSTXYL4 : PACKED ARRAY[ 0..15] OF BOOLEAN;
            
              BEGIN
                MOVELEFT( CHARACTR[ CAMPCHAR].LOSTXYL.AWARDS[ 4], LOSTXYL4, 2);
                WRITE( '"');   (* 1 DOUBLE QUOTE *)
                FOR INDX := 0 TO 15 DO
                  IF LOSTXYL4[ INDX] THEN
                    WRITE( COPY( '>!$#&*<?BCPKODG@', INDX + 1, 1) );
                WRITE(  '" ')
              END;  (* CHEVRONS *)
        
        
        
            BEGIN  (* DSPSTATS *)
              WITH CHARACTR[ CAMPCHAR] DO
                BEGIN
                  WRITE( CHR( 12));
                  WRITE( NAME);
                  WRITE( ' ');
                  IF LOSTXYL.AWARDS[ 4] > 0 THEN
                    CHEVRONS;
                  WRITE( SCNTOC.RACE[ RACE]);
                  WRITE( ' ');
                  WRITE( COPY( SCNTOC.ALIGN[ ALIGN], 1, 1) );
                  WRITE( '-');
                  WRITE( SCNTOC.CLASS[ CLASS]);
                  WRITELN;
                  WRITELN;
                  WRITE( 'STRENGTH' :12);
                  WRITE( ATTRIB[ STRENGTH] :3);
                  WRITE( 'GOLD ' :9);
                  PRNTLONG( GOLD);
                  WRITELN;
                  WRITE( 'I.Q.' :12);
                  WRITE( ATTRIB[ IQ] :3);
                  WRITE( 'EXP ' :9);
                  PRNTLONG( EXP);
                  WRITELN;
                  WRITE( 'PIETY' :12);
                  WRITE( ATTRIB[ PIETY] :3);
                  WRITELN;
                  WRITE( 'VITALITY' :12);
                  WRITE( ATTRIB[ VITALITY] :3);
                  WRITE( 'LEVEL ' :9);
                  WRITE( CHARLEV :3);
                  WRITE( 'AGE ' :9);
                  WRITE( (AGE DIV 52) :3);
                  WRITELN;
                  WRITE( 'AGILITY' :12);
                  WRITE( ATTRIB[ AGILITY] :3);
                  WRITE( 'HITS ' :9);
                  WRITE( HPLEFT :3);
                  WRITE( '/');
                  WRITE( HPMAX :3);
                  WRITE( 'AC' :4);
                  WRITE( (ARMORCL - ACMOD2) :4);
                  WRITELN;
                  WRITE( 'LUCK' : 12);
                  WRITE( ATTRIB[ LUCK] :3);
                  WRITE( 'STATUS ' :9);
                  WRITE( SCNTOC.STATUS[ STATUS]);
                  IF LOSTXYL.POISNAMT[ 1] > 0 THEN
                    WRITE( ' & POISONED');
                  WRITELN;
                  DSPSPELS;
                  DSPITEMS
                END
            END;
        
        
          BEGIN  (* CAMPMENU *)
            WITH CHARACTR[ CAMPCHAR] DO
              BEGIN
                IF DISPSTAT THEN
                  DSPSTATS;
                GOTOXY( 0, 18);
                IF XGOTO = XINSPCT3 THEN
                  MENUTYPE := 0
                ELSE IF XGOTO = XINSPECT THEN
                  MENUTYPE := 1
                ELSE IF STATUS = OK THEN
                  MENUTYPE := 2
                ELSE
                  MENUTYPE := 1;
                  
                IF MENUTYPE = 2 THEN
                  BEGIN
                    WRITE( CHR( 11));
                    WRITELN( 'YOU MAY E)QUIP, D)ROP AN ITEM, T)RADE,');
                    WRITE( ' ' :8);
                    WRITELN( 'R)EAD SPELL BOOKS, CAST S)PELLS,');
                    WRITE( ' ' :8);
                    WRITELN( 'U)SE AN ITEM, I)DENTIFY AN ITEM,');
                    WRITE( ' ' :8);
                    WRITELN( 'OR L)EAVE.')
                  END
                ELSE IF MENUTYPE = 1 THEN
                  BEGIN
                    WRITE( CHR( 11));
                    WRITELN( 'YOU MAY E)QUIP, D)ROP AN ITEM, T)RADE,');
                    WRITE( ' ' :8);
                    WRITELN( 'R)EAD SPELL BOOKS, OR L)EAVE.')
                  END
                ELSE
                  BEGIN
                    WRITE( CHR( 11));
                    WRITELN( 'YOU MAY R)EAD SPELL BOOKS OR L)EAVE.')
                  END;
              END
          END;  (* CAMPMENU *)
          
          
        BEGIN (* CAMPDO *)
          CAMPMENU;
          DISPSTAT := TRUE;
          REPEAT
            GOTOXY( 41, 0);
            GETKEY
          UNTIL (INCHAR = 'R') OR (INCHAR = 'L') OR
                ((MENUTYPE > 0) AND
                 ((INCHAR = 'T') OR (INCHAR = 'D') OR (INCHAR = 'E'))) OR
                ((MENUTYPE > 1) AND
                 ((INCHAR = 'I') OR (INCHAR = 'S') OR (INCHAR = 'U')));
          
          CASE INCHAR OF
            'L':  EXIT( CAMPDO);
            'E':  IF MENUTYPE > 0 THEN
                    BEGIN
                      XGOTO := XEQPDSP;
                      LLBASE04 := CAMPCHAR;
                      EXIT( CAMP)
                    END;
            'R':  BEGIN
                    XGOTO := XCAMPSTF;
                    BASE12.GOTOX := XDONE;
                    LLBASE04 := CAMPCHAR;
                    EXIT( CAMP)
                  END;
            'D':  IF MENUTYPE > 0 THEN
                    DROPITEM;
            'I':  IF MENUTYPE = 2 THEN
                    IDENTIFY;
            'S':  IF MENUTYPE = 2 THEN
                    CASTSPEL( -1);
            'U':  IF MENUTYPE = 2 THEN
                    USEITEM;
            'T':  DOTRADE
           END
        END;  (* CAMPDO *)
        
        
      BEGIN  (* INSPECT *)
        CAMPCHAR := LLBASE04;
        XGOTO2 := XGOTO;
        WRITE( CHR( 12));
        REPEAT
          CAMPDO;
        UNTIL INCHAR = 'L';
        WRITE( CHR( 12))
      END;   (* INSPECT *)
      
      
  PROCEDURE CAMPMEN2;  (* P010C1F *)
  
    VAR
         CHARX : INTEGER;
      
      
    PROCEDURE DSP1LINE( CHARX: INTEGER);  (* P010C20 *)
    
      BEGIN
        GOTOXY(  0, 3 + CHARX);
        WRITE( CHR( 29));
        WRITE( (CHARX + 1) : 2);
        WRITE( ' ');
        WRITE( CHARACTR[ CHARX].NAME);
        GOTOXY( 19, 3 + CHARX);
        WRITE( COPY( SCNTOC.ALIGN[ CHARACTR[ CHARX].ALIGN], 1, 1));
        WRITE( '-');
        WRITE( COPY( SCNTOC.CLASS[ CHARACTR[ CHARX].CLASS], 1, 3));
        WRITE( ' ');
        IF CHARACTR[ CHARX].ARMORCL - ACMOD2 > -10 THEN
          WRITE( (CHARACTR[ CHARX].ARMORCL - ACMOD2) : 2)
        ELSE
          WRITE( 'LO');
        WRITE( CHARACTR[ CHARX].HPLEFT : 5);
        LLBASE04 := CHARACTR[ CHARX].HEALPTS -
                    CHARACTR[ CHARX].LOSTXYL.POISNAMT[ 1];
        IF LLBASE04 > 0 THEN
          WRITE( '+')
        ELSE IF LLBASE04 < 0 THEN
          WRITE( '-')
        ELSE
          WRITE( ' ');
                    
        IF CHARACTR[ CHARX].STATUS = OK THEN
          IF CHARACTR[ CHARX].LOSTXYL.POISNAMT[ 1] <> 0 THEN
            WRITELN( 'POISON')
          ELSE
            WRITELN( CHARACTR[ CHARX].HPMAX :4)
        ELSE
          WRITELN( SCNTOC.STATUS[ CHARACTR[ CHARX].STATUS]);
      END;
      
      
    BEGIN (* CAMPMEN2 *)
      WRITE( CHR( 12));
      WRITELN( 'CAMP' :22);
      WRITELN;
      WRITELN( ' # CHARACTER NAME  CLASS AC HITS STATUS');
      FOR CHARX := 0 TO PARTYCNT - 1 DO
        BEGIN
          DSP1LINE( CHARX)
        END;
      GOTOXY( 0, 12);
      WRITELN( 'YOU MAY R)EORDER, E)QUIP, D)ISBAND,');
      WRITE( ' ' :8);
      WRITELN( '#) TO INSPECT, OR');
      WRITE( ' ' :8);
      WRITELN( 'L)EAVE THE CAMP.')
    END;  (* CAMPMEN2 *)
      
      
  PROCEDURE DISBAND;  (* P010C21 *)
  
  
    PROCEDURE CONFIRM( NULLRE :STRING);  (* P010C22 *)
    
      BEGIN (* CONFIRM *)
        WRITE( CHR( 12));
        WRITE( NULLRE);
        WRITE( 'CONFIRM (Y/N) ?');
        REPEAT
          GOTOXY( 41, 0);
          READ( INCHAR)
        UNTIL (INCHAR = 'Y') OR (INCHAR = 'N');
        IF INCHAR = 'N' THEN
          EXIT( DISBAND)
      END;  (* CONFIRM *)
      
      
    BEGIN (* DISBAND *)
      CONFIRM( '');
      CONFIRM( 'RE-');
      FOR LLBASE04 := 0 TO PARTYCNT - 1 DO
        BEGIN
          WITH CHARACTR[ LLBASE04] DO
            BEGIN
              INMAZE := FALSE;
              LOSTXYL.LOCATION[ 1] := MAZEX;
              LOSTXYL.LOCATION[ 2] := MAZEY;
              LOSTXYL.LOCATION[ 3] := MAZELEV;
              AGE := AGE + 25;
              MOVELEFT( CHARACTR[ LLBASE04],
                        IOCACHE[ GETRECW(
                                         ZCHAR,
                                         CHARDISK[ LLBASE04],
                                         SIZEOF( TCHAR))],
                        SIZEOF( TCHAR) )
            END
        END;
        
        MOVELEFT( IOCACHE[ GETREC( ZZERO, 0, SIZEOF( TSCNTOC))], 
                  SCNTOC,
                  SIZEOF( TSCNTOC) );
        LLBASE04 := -2;
        XGOTO := XSCNMSG;
        EXIT( CAMP)
    END;  (* DISBAND *)
        
        
    BEGIN  (* CAMP *)
      DISPSTAT := TRUE;
      FOR OBJI := 1 TO 8 DO
        OBJIDS[ OBJI - 1] := -1;
      TEXTMODE;
      IF (XGOTO = XBCK2CMP) OR
         (XGOTO = XBK2CMP2) THEN
        BEGIN
          XGOTO := XGOTO2;
          IF XGOTO = XINSPCT2 THEN
            INSPECT
        END;
      IF XGOTO = XINSPECT THEN
        BEGIN
          INSPECT;
          XGOTO := XGILGAMS;
          EXIT( CAMP)
        END;
      IF XGOTO = XINSPCT3 THEN
        BEGIN
          LLBASE04 := 0;
          INSPECT;
          XGOTO := XBCK2ROL;
          EXIT( CAMP)
        END;
      
      REPEAT
        UNITCLEAR( 1);
        CAMPMEN2;
        GOTOXY( 41, 0);
        GETKEY;
        IF (INCHAR > '0') AND (INCHAR <= CHR( ORD( '0') + PARTYCNT)) THEN
          BEGIN
            LLBASE04 := ORD( INCHAR) - ORD( '1');
            FOR OBJI := 1 TO 8 DO
              OBJIDS[ OBJI - 1] := -1;
            INSPECT
          END
        ELSE
          BEGIN
            CASE INCHAR OF
             'R':  BEGIN
                     XGOTO := XREORDER;
                     EXIT( CAMP)
                   END;
             'L':  BEGIN
                     XGOTO := XCMP2EQ6;
                     EXIT( CAMP)
                   END;
             'E':  BEGIN
                     XGOTO := XEQPDSP;
                     LLBASE04 := -1;
                     EXIT( CAMP)
                   END;
             'D':  DISBAND;
            END;
          END;
          
      UNTIL FALSE
    END;  (* CAMP *)
  

(* ========================================================================== *)
(* DISK: Wiz1C.DSK | FILE: REWARDS.TEXT                                *)
(* ========================================================================== *)

    
SEGMENT PROCEDURE REWARDS;    (* P010D01 *)
    
    VAR
         EXPPERCH : TWIZLONG;
         ALIVECNT : INTEGER;
         ONEORTWO : INTEGER;
         REWARDI  : INTEGER;
         TRAP3TYP : INTEGER;
  
      
    PROCEDURE PIC2SCRN( BUFFERI: INTEGER);  (* P010D02 *)
    
      TYPE
           BYTE = PACKED ARRAY[ 0..1] OF CHAR;
    
      VAR
           PIXLIN : INTEGER;
           UNUSED : INTEGER;
           MEMLOC : RECORD CASE INTEGER OF
               1 : (I : INTEGER);
               2 : (P : ^BYTE);
             END;
           
      BEGIN
        CLRPICT( 0, 0, 0, 100);  (* CLEAR PICTURE *)
        FOR PIXLIN := 23 TO 72 DO
          BEGIN
            MEMLOC.I := 8193 + 1024 * (PIXLIN MOD 8) +
                        128 * ((PIXLIN MOD 64) DIV 8) +
                        40 * (PIXLIN DIV 64);
            MOVELEFT( IOCACHE[ BUFFERI], MEMLOC.P^, 10);
            BUFFERI := BUFFERI + 10
          END;
      END;  (* PIC2SCRN *)
      
      
    PROCEDURE PRLONG2( VAR MP01 : TWIZLONG);  (* P010D03 *)
    
      VAR
           BCDNUM   : TBCD;
           NONZEROI : INTEGER;
           SUPPRESI : INTEGER;
           
      BEGIN
        LONG2BCD( MP01, BCDNUM);
        SUPPRESI := 1;
        WHILE (SUPPRESI < 12) AND (BCDNUM[ SUPPRESI] = 0) DO
          SUPPRESI := SUPPRESI + 1;
        FOR NONZEROI := SUPPRESI TO 12 DO
          PRINTCHR( CHR( BCDNUM[ NONZEROI] + ORD( '0')))
      END;
      
      
    PROCEDURE ENMYREWD;  (* P010D04 *)
    
      VAR
           ENEMY : TENEMY;
    
      BEGIN
        MOVELEFT( IOCACHE[ GETREC( ZENEMY, ENEMYINX, SIZEOF( TENEMY))],
                  ENEMY,
                  SIZEOF( TENEMY));
        IF ENEMY.UNIQUE > 0 THEN
          BEGIN
            ENEMY.UNIQUE := ENEMY.UNIQUE - 1;
            MOVELEFT( ENEMY,
                      IOCACHE[ GETRECW( ZENEMY, ENEMYINX, SIZEOF( TENEMY))],
                      SIZEOF( TENEMY))
          END;
        ONEORTWO := 1;
        IF ATTK012 = 0 THEN
          REWARDI := ENEMY.REWARD1
        ELSE IF ATTK012 = 1 THEN
          BEGIN
            REWARDI := ENEMY.REWARD1;
            ONEORTWO := 2
          END
        ELSE
          REWARDI := ENEMY.REWARD2
      END;  (* ENMYREWD *)
      
      
    PROCEDURE FOUNDITM( FNDCHARX: INTEGER;  (* P010D05 *)
                        POSSX   : INTEGER;
                        ITEMINDX: INTEGER);
    
      VAR
           OBJECTRC : TOBJREC;
    
        
      BEGIN  (* FOUNDITM *)
        MOVELEFT( IOCACHE[ GETREC( ZOBJECT,
                                   ITEMINDX,
                                   SIZEOF( TOBJREC))],
                  OBJECTRC,
                  SIZEOF( TOBJREC));
        CLRRECT( 1, 11, 38, 4);
        MVCURSOR( 1, 12);
        PRINTSTR( CHARACTR[ FNDCHARX].NAME);
        PRINTSTR( ' FOUND - ');
        PRINTSTR( OBJECTRC.NAMEUNK);
        WITH CHARACTR[ FNDCHARX].POSS DO
          BEGIN
            POSSX := POSSCNT + 1;
            POSSESS[ POSSX].EQUIPED := FALSE;
            POSSESS[ POSSX].IDENTIF := FALSE;
            POSSESS[ POSSX].CURSED  := FALSE;
            POSSESS[ POSSX].EQINDEX := ITEMINDX;
            POSSCNT := POSSX
          END
      END;   (* FOUNDITM *)
      
      
    PROCEDURE CHSTGOLD;  (* P010D06 *)

      TYPE
      
        TREWARDX = RECORD
            REWDPERC : INTEGER;
            BITEM    : INTEGER;
            REWDCALC : RECORD CASE INTEGER OF
                1: (GOLD:  RECORD
                      TRIES   : INTEGER;
                      AVEAMT  : INTEGER;
                      MINADD  : INTEGER;
                      MULTX   : INTEGER;
                      TRIES2  : INTEGER;
                      AVEAMT2 : INTEGER;
                      MINADD2 : INTEGER;
                    END);
                2: (ITEM:  RECORD
                      MININDX  : INTEGER;
                      MFACTOR  : INTEGER;
                      MAXTIMES : INTEGER;
                      RANGE    : INTEGER;
                      PERCBIGR : INTEGER;
                      UNUSEDXX : INTEGER;
                      UNUSEDYY : INTEGER;
                    END);
              END;
          END;
          
        TREWARD = RECORD
            BCHEST   : BOOLEAN;
            BTRAPTYP : PACKED ARRAY[ 0..7] OF BOOLEAN;
            REWRDCNT : INTEGER;
            REWARDXX : ARRAY[ 1..9] OF TREWARDX;
          END;
      
      VAR
           CHRXCHST : INTEGER;
           INDX     : INTEGER;
           GOLD2ONE : TWIZLONG;
           REWARDZ  : TREWARD;
    
    
      PROCEDURE RDREWARD;  (* P010D07 *)
      
        BEGIN
          MOVELEFT( IOCACHE[ GETREC( ZREWARD, REWARDI, SIZEOF( TREWARD))],
                    REWARDZ,
                    SIZEOF( TREWARD))
        END;
        
        
      PROCEDURE ACHEST;  (* P010D08 *)
      
        VAR
             WHOTRIED : ARRAY[ 0..5] OF BOOLEAN;
             TRAPTYPE : INTEGER;
             
             
        PROCEDURE GTTRAPTY;  (* P010D09 *)
        
        VAR
             BTRAPPED : BOOLEAN;
             UNUSEDXX : INTEGER;
             UNUSEDYY : INTEGER;
             ZERO99   : INTEGER;
        
          BEGIN
            BTRAPPED := FALSE;
            FOR TRAPTYPE := 0 TO 7 DO
              IF REWARDZ.BTRAPTYP[ TRAPTYPE] THEN
                BTRAPPED := TRUE;
            TRAP3TYP := (RANDOM MOD 5);
            IF NOT BTRAPPED THEN
              TRAPTYPE := 0
            ELSE
              IF (RANDOM MOD 15) > (4 + MAZELEV) THEN
                TRAPTYPE := 0
              ELSE
                BEGIN
                  ZERO99 := RANDOM MOD 100;
                  TRAPTYPE := 0;
                  WHILE ZERO99 > 0 DO
                    
                    REPEAT
                      IF TRAPTYPE < 7 THEN
                        BEGIN
                          IF TRAPTYPE = 3 THEN
                            ZERO99 := ZERO99 - 5
                          ELSE
                            ZERO99 := ZERO99 - 1;
                          TRAPTYPE := TRAPTYPE + 1
                        END
                      ELSE
                        TRAPTYPE := 0 + 1
                    UNTIL REWARDZ.BTRAPTYP[ TRAPTYPE]
                    
                END
          END;  (* GTTRAPTY *)
          
          
        PROCEDURE EXITRWDS;  (* P010D0A *)
        
          BEGIN
            EXIT( REWARDS)
          END;
          
          
        PROCEDURE PRTRAPTY( TRAPTYPE: INTEGER;  (* P010D0B *)
                            TRAP3TY:  INTEGER);
          
          VAR
               UNUSEDXX : INTEGER;
        
          BEGIN
            CASE TRAPTYPE OF
              0:  PRINTSTR( 'TRAPLESS CHEST');
              1:  PRINTSTR( 'POISON NEEDLE');
              2:  PRINTSTR( 'GAS BOMB');
              3:  CASE TRAP3TY OF
                    0:  PRINTSTR( 'CROSSBOW BOLT');
                    1:  PRINTSTR( 'EXPLODING BOX');
                    2:  PRINTSTR( 'SPLINTERS');
                    3:  PRINTSTR( 'BLADES');
                    4:  PRINTSTR( 'STUNNER');
                  END;
              4:  PRINTSTR( 'TELEPORTER');
              5:  PRINTSTR( 'ANTI-MAGE');
              6:  PRINTSTR( 'ANTI-PRIEST');
              7:  PRINTSTR( 'ALARM');
            END;
            PAUSE2
          END;  (* PRTRAPTY *)
          
          
        PROCEDURE DOTRAPDM;  (* P010D0C *)
        
          VAR
               UNUSEDXX : INTEGER;
               UNUSEDYY : INTEGER;
               CHARX    : INTEGER;
        
        
          PROCEDURE HPDAMAGE( CHARXHIT: INTEGER;  (* P010D0D *)
                              HITCNT:   INTEGER;
                              HITDAM:   INTEGER);
          
            VAR
                 TOTDAM : INTEGER;
          
            BEGIN
              TOTDAM := 0;
              WHILE HITCNT > 0 DO
                BEGIN
                  TOTDAM := TOTDAM + (RANDOM MOD HITDAM) + 1;
                  HITCNT := HITCNT - 1
                END;
              CHARACTR[ CHARXHIT].HPLEFT := CHARACTR[ CHARXHIT].HPLEFT - TOTDAM;
              IF CHARACTR[ CHARXHIT].HPLEFT < 1 THEN
                BEGIN
                  CHARACTR[ CHARXHIT].HPLEFT := 0;
                  CHARACTR[ CHARXHIT].STATUS := DEAD;
                  CLRRECT( 1, 11, 38, 4);
                  MVCURSOR( 1, 12);
                  PRINTSTR( CHARACTR[ CHARXHIT].NAME);
                  PRINTSTR( ' DIES!');
                  ALIVECNT := ALIVECNT - 1;
                  IF ALIVECNT = 0 THEN
                    BEGIN
                      XGOTO := XCEMETRY;
                      EXIT( REWARDS)
                    END
                END
            END;  (* HPDAMAGE *)
            
            
          PROCEDURE ANTIPM( BMAGEDAM: BOOLEAN);  (* P010D0E *)
          
           VAR
                PLYZSTON : BOOLEAN;
                CHARPM   : INTEGER;
          
          
            PROCEDURE ISSTONED;  (* P010D0F *)
            
              BEGIN
                IF CHARACTR[ CHARPM].STATUS < STONED THEN
                  CHARACTR[ CHARPM].STATUS := STONED
              END;
              
              
            PROCEDURE ISPLYZE;  (* P010D10 *)
            
              BEGIN
                IF CHARACTR[ CHARPM].STATUS < PLYZE THEN
                  CHARACTR[ CHARPM].STATUS := PLYZE
              END;
              
              
            BEGIN  (* ANTIPM *)
              FOR CHARPM := 0 TO PARTYCNT - 1 DO
                BEGIN
                  PLYZSTON := (RANDOM MOD 20) < CHARACTR[ CHARPM].LUCKSKIL[ 4];
                  
                  CASE CHARACTR[ CHARPM].CLASS OF
                  
                       MAGE:  IF BMAGEDAM THEN
                                IF PLYZSTON THEN
                                  ISPLYZE
                                ELSE
                                  ISSTONED;
                                  
                    SAMURAI:  IF BMAGEDAM THEN
                                IF NOT PLYZSTON THEN
                                  ISPLYZE;
                                 
                     PRIEST:  IF NOT BMAGEDAM THEN
                                IF PLYZSTON THEN
                                  ISPLYZE
                                ELSE
                                  ISSTONED;
                                  
                     BISHOP:  IF NOT BMAGEDAM THEN
                                IF NOT PLYZSTON THEN  (* IF NOT SET... *)
                                  ISPLYZE;
                  END
                END
            END;   (* ANTIPM *)
          
          
          PROCEDURE TYPE3DAM;  (* P010D11 *)
          
          
            PROCEDURE HPDAMALL( CHANCHIT: INTEGER;  (* P010D12 *)
                                HITCNT:   INTEGER;
                                HITDAM:   INTEGER);
                               
              VAR
                   CHARXHIT : INTEGER;
            
              BEGIN
                FOR CHARXHIT := 0 TO PARTYCNT - 1 DO
                  IF (RANDOM MOD 100) < CHANCHIT THEN
                    HPDAMAGE( CHARXHIT, HITCNT, HITDAM)
                  ELSE
                    IF (RANDOM MOD 100) < CHANCHIT THEN
                      HPDAMAGE( CHARXHIT, HITCNT, (HITDAM DIV 2) + 1)
              END;  (* HPDAMALL *)
              
              
            BEGIN (* TYPE3DAM *)
              CASE TRAP3TYP OF
                0:  HPDAMAGE( CHRXCHST, MAZELEV, 8);  (* CROSSBOW BOLT *)
                1:  HPDAMALL(       50, MAZELEV, 8);  (* EXPLODING BOX *)
                2:  HPDAMALL(       70, MAZELEV, 6);  (* SPLINTERS     *)
                3:  HPDAMALL(       30, MAZELEV, 12); (* BLADES        *)
                4:  CHARACTR[ CHRXCHST].STATUS := PLYZE;  (* STUNNER       *)
              END
            END;  (* TYPE3DAM *)
        
        
          BEGIN (* DOTRAPDM *)
            CLRRECT( 13, 8, 26, 2);
            MVCURSOR( 13, 8);
            IF TRAPTYPE <> 0 THEN
              BEGIN
                PRINTSTR( 'OOPPS! A ');
                PRTRAPTY( TRAPTYPE, TRAP3TYP)
              END
            ELSE
              PRINTSTR( 'THE CHEST WAS NOT TRAPPED');
            PAUSE2;
            
            CASE TRAPTYPE OF
            
              1:  (* POISON *)
              
                    CHARACTR[ CHRXCHST].LOSTXYL.POISNAMT[ 1] :=
                      CHARACTR[ CHRXCHST].LOSTXYL.POISNAMT[ 1] + 1;
                   
              2:  (* GAS *)
              
                    FOR CHARX := 0 TO PARTYCNT - 1 DO
                      IF (RANDOM MOD 20) < CHARACTR[ CHARX].LUCKSKIL[ 3] THEN
                        CHARACTR[ CHARX].LOSTXYL.POISNAMT[ 1] := 1;
                        
              3:  (* CROSSBOW BOLT *)
                  (* EXPLODING     *)
                  (* SPLINTERS     *)
                  (* BLADES        *)
                  (* STUNNER       *)
                  
                    TYPE3DAM;
                
              4:  (* TELEPORTER    *)
              
                    BEGIN
                      MAZEX := RANDOM MOD (19 + 1);
                      MAZEY := RANDOM MOD (19 + 1);
                      DIRECTIO := RANDOM MOD 4
                    END;
                    
              5:  (* ANTI-MAGE *)
                  
                    ANTIPM( TRUE);
                
              6:  (* ANTI-PRIEST *)
              
                    ANTIPM( FALSE);
                
              7:  (* ALARM *)
              
                    BEGIN
                      CHSTALRM := 1;
                      EXIT( REWARDS)
                    END;
            END;
            
            EXIT( ACHEST)
          END;  (* DOTRAPDAM *)
          
          
        PROCEDURE PRTRAP;  (* P010D13 *)
        
          BEGIN
            CLRRECT( 13, 8, 26, 2);
            MVCURSOR( 13, 8);
            PRTRAPTY( TRAPTYPE, TRAP3TYP);
            PAUSE2
          END;
          
          
        PROCEDURE PRRNDTRP;  (* P010D14 *)
        
          VAR
               RNDX   : INTEGER;
               LOOPER : INTEGER;
               TRAP   : INTEGER;
        
          BEGIN
            TRAP := 0;
            RNDX := RANDOM MOD 50;
            FOR LOOPER := 1 TO RNDX DO
              IF TRAP = 7 THEN
                TRAP := 0
              ELSE
                TRAP := TRAP + 1;
            CLRRECT( 13, 8, 26, 2);
            MVCURSOR( 13, 8);
            PRTRAPTY( TRAP, RANDOM MOD 5);
            PAUSE2
          END;  (* PRRNDTRP *)
          
          
        PROCEDURE INSPCHST;  (* P010D15 *)
        
          VAR
               UNUSEDXX : INTEGER;
               CHNCGOOD : INTEGER;
               CHARINSP : INTEGER;
               
          BEGIN
            CLRRECT( 13, 8, 26, 2);
            MVCURSOR( 15, 8);
            PRINTSTR( 'WHO (#) WILL INSPECT?');
            GETKEY;
            CHARINSP := ORD( INCHAR) - ORD( '0') - 1;
            
            IF (CHARINSP < 0) OR (CHARINSP >= PARTYCNT) THEN
              EXIT( INSPCHST);
            IF CHARACTR[ CHARINSP].STATUS <> OK THEN
              EXIT( INSPCHST);
            IF WHOTRIED[ CHARINSP] THEN
              BEGIN
                CLRRECT( 13, 8, 26, 1);
                MVCURSOR( 16, 8);
                PRINTSTR( 'YOU ALREADY LOOKED!');
                PAUSE2;
                EXIT( INSPCHST)
              END;
            WHOTRIED[ CHARINSP] := TRUE;
            CHNCGOOD := CHARACTR[ CHARINSP].ATTRIB[ AGILITY];
            IF CHARACTR[ CHARINSP].CLASS = THIEF THEN
              CHNCGOOD := CHNCGOOD * 6
            ELSE
              IF CHARACTR[ CHARINSP].CLASS = NINJA THEN
                CHNCGOOD := CHNCGOOD * 4;
            IF CHNCGOOD > 95 THEN
              CHNCGOOD := 95;
            CHRXCHST := CHARINSP;
            IF (RANDOM MOD 100) < CHNCGOOD THEN
              PRTRAP
            ELSE
              IF (RANDOM MOD 20) > CHARACTR[ CHARINSP].ATTRIB[ AGILITY] THEN
                DOTRAPDM
              ELSE
                PRRNDTRP;
          END;  (* INSPCHST *)
          
          
        PROCEDURE CALFOCH;  (* P010D16 *)
        
          BEGIN
            CLRRECT( 13, 8, 26, 2);
            MVCURSOR( 14, 8);
            PRINTSTR( 'WHO (#) WILL CAST CALFO?');
            GETKEY;
            CHRXCHST := ORD( INCHAR) - ORD( '0') - 1;
            
            IF (CHRXCHST < 0) OR (CHRXCHST >= PARTYCNT) THEN
              EXIT( CALFOCH);
            IF NOT (CHARACTR[ CHRXCHST].SPELLSKN[ 28]) THEN
              EXIT( CALFOCH);
            IF CHARACTR[ CHRXCHST].PRIESTSP[ 2] = 0 THEN
              EXIT( CALFOCH);
            IF CHARACTR[ CHRXCHST].STATUS <> OK THEN
              EXIT( CALFOCH);
            WITH CHARACTR[ CHRXCHST] DO
              BEGIN
                PRIESTSP[ 2] := PRIESTSP[ 2] - 1;
                IF (RANDOM MOD 100) < 95 THEN
                  PRTRAP
                ELSE
                  PRRNDTRP
              END
          END;  (* CALFOCH *)
          
          
        PROCEDURE DISARMTR;  (* P010D17 *)
        
          VAR
               UNUSEDXX : INTEGER;
               UNUSEDYY : INTEGER;
               UNUSEDZZ : INTEGER;
               TRAPSTR  : STRING;
        
        
          PROCEDURE DISARM;  (* P010D18 *)
          
            BEGIN
              CLRRECT( 13, 8, 26, 2);
              MVCURSOR( 18, 8);
              IF (RANDOM MOD 70) < 
                 (  CHARACTR[ CHRXCHST].CHARLEV
                  - MAZELEV
                  + (50 * ORD( ((CHARACTR[ CHRXCHST].CLASS = THIEF) OR
                                (CHARACTR[ CHRXCHST].CLASS = NINJA)))
                    )
                 ) THEN
                BEGIN
                  PRINTSTR( 'YOU DISARMED IT!');
                  PAUSE2;
                  EXIT( ACHEST)
                END
              ELSE
                IF (RANDOM MOD 20) < CHARACTR[ CHRXCHST].ATTRIB[ AGILITY] THEN
                  BEGIN
                    PRINTSTR( 'DISARM FAILED!!');
                    PAUSE2;
                    EXIT( DISARMTR)
                  END
                ELSE
                  BEGIN
                    PRINTSTR( 'YOU SET IT OFF!');
                    PAUSE2;
                    DOTRAPDM
                  END
            END;  (* DISARM *)
          
          
          BEGIN  (* DISARMTR *)
            CLRRECT( 13, 8, 26, 2);
            MVCURSOR( 16, 8);
            PRINTSTR( 'WHO (#) WILL DISARM?');
            GETKEY;
            CHRXCHST := ORD( INCHAR) - ORD( '0') - 1;
            
            IF (CHRXCHST < 0) OR (CHRXCHST >= PARTYCNT) THEN
              EXIT( DISARMTR);
            IF CHARACTR[ CHRXCHST].STATUS <> OK THEN
              EXIT( DISARMTR);
            CLRRECT( 13, 8, 26, 2);
            MVCURSOR( 13, 8);
            PRINTSTR( 'WHAT TRAP >');
            GETSTR( TRAPSTR, 24, 8);
            IF (TRAPSTR = 'POISON NEEDLE') AND (TRAPTYPE = 1) THEN
              DISARM
            ELSE IF (TRAPSTR = 'GAS BOMB') AND (TRAPTYPE = 2) THEN
              DISARM
            ELSE IF TRAPTYPE = 3 THEN
              BEGIN
                CASE TRAP3TYP OF
                  0:  IF TRAPSTR = 'CROSSBOW BOLT' THEN
                        DISARM;
                       
                  1:  IF TRAPSTR = 'EXPLODING BOX' THEN
                        DISARM;
                       
                  2:  IF TRAPSTR = 'SPLINTERS' THEN
                        DISARM;
                       
                  3:  IF TRAPSTR = 'BLADES' THEN
                        DISARM;
                       
                  4:  IF TRAPSTR = 'STUNNER' THEN
                        DISARM;
                END;
                
                (* DOTRAPDM *)
              END
            ELSE IF (TRAPSTR = 'TELEPORTER') AND (TRAPTYPE = 4) THEN
              DISARM
            ELSE IF (TRAPSTR = 'ANTI-MAGE') AND (TRAPTYPE = 5) THEN
              DISARM
            ELSE IF (TRAPSTR = 'ANTI-PRIEST') AND (TRAPTYPE = 6) THEN
              DISARM
            ELSE IF (TRAPSTR = 'ALARM') AND (TRAPTYPE = 7) THEN
              DISARM
            ELSE
              DOTRAPDM
          END;   (* DISARMTR *)
          
          
        PROCEDURE OPENCHST;  (* P010D19 *)
        
          BEGIN
            CLRRECT( 13, 8, 26, 2);
            MVCURSOR( 17, 8);
            PRINTSTR( 'WHO (#) WILL OPEN?');
            GETKEY;
            CHRXCHST := ORD( INCHAR) - ORD( '0') - 1;
            
            IF (CHRXCHST < 0) OR (CHRXCHST >= PARTYCNT) THEN
              EXIT( OPENCHST);
            IF CHARACTR[ CHRXCHST].STATUS <> OK THEN
              EXIT( OPENCHST);
            IF TRAPTYPE = 0 THEN
              EXIT( ACHEST);
            IF (RANDOM MOD 1000) < CHARACTR[ CHRXCHST].CHARLEV THEN
              EXIT( ACHEST);
            DOTRAPDM
          END;  (* OPENCHST *)
          
          
        BEGIN (* ACHEST *)
          PIC2SCRN( GETREC( ZSPCCHRS, 18, 512));
          FILLCHAR( WHOTRIED, 12, 0);
          GTTRAPTY;
          CLRRECT( 13, 6, 26, 4);
          MVCURSOR( 13, 6);
          PRINTSTR( 'A CHEST! YOU MAY:');
          REPEAT
            CLRRECT( 13, 8, 26, 2);
            MVCURSOR( 13, 8);
            PRINTSTR( 'O)PEN     C)ALFO   L)EAVE');
            MVCURSOR( 13, 9);
            PRINTSTR( 'I)NSPECT  D)ISARM');
            GETKEY;
            
            IF      INCHAR = 'O' THEN
              OPENCHST
            ELSE IF INCHAR = 'L' THEN
              EXITRWDS
            ELSE IF INCHAR = 'I' THEN
              INSPCHST
            ELSE IF INCHAR = 'C' THEN
              CALFOCH
            ELSE IF INCHAR = 'D' THEN
              DISARMTR
          UNTIL FALSE
        END;  (* ACHEST *)
        
        
      PROCEDURE GETREWRD( REWARDM: TREWARDX);  (* P010D1A *)
      
        VAR
             ITEMINDX : INTEGER;
             CHARIIII : INTEGER;
             CHARXXXX : INTEGER;  (* MULTIPLE USES *)
      
      
        FUNCTION CALCULAT( TRIES:  INTEGER;  (* P010D1B *)
                           AVEAMT: INTEGER;
                           MINADD: INTEGER) : INTEGER;
        
          VAR
               TOTAL : INTEGER;
               
          BEGIN
            TOTAL := MINADD;
            WHILE TRIES > 0 DO
              BEGIN
                TOTAL := TOTAL + (RANDOM MOD AVEAMT) + 1;
                TRIES := TRIES - 1
              END;
            CALCULAT := TOTAL
          END;  (* CALCULAT *)
          
          
        PROCEDURE GOLDREWD;  (* P010D1C *)
        
        VAR
             GOLDAMT : TWIZLONG;
        
          BEGIN
            FILLCHAR( GOLDAMT, 6, 0);
            GOLDAMT.LOW := CALCULAT( REWARDM.REWDCALC.GOLD.TRIES,
                                     REWARDM.REWDCALC.GOLD.AVEAMT,
                                     REWARDM.REWDCALC.GOLD.MINADD);
            MULTLONG( GOLDAMT, REWARDM.REWDCALC.GOLD.MULTX);
            CHARXXXX := CALCULAT( REWARDM.REWDCALC.GOLD.TRIES2,
                                  REWARDM.REWDCALC.GOLD.AVEAMT2,
                                  REWARDM.REWDCALC.GOLD.MINADD2);
            MULTLONG( GOLDAMT, CHARXXXX);
            MULTLONG( GOLDAMT, ONEORTWO);
            ADDLONGS( GOLD2ONE, GOLDAMT)
          END;  (* GOLDREWD *)
          
          
        PROCEDURE ITEMREWD;  (* P010D1D *)
        
          BEGIN
            CHARXXXX := RANDOM MOD PARTYCNT;
            WHILE CHARACTR[ CHARXXXX].STATUS <> OK DO
              CHARXXXX := (CHARXXXX + 1) MOD PARTYCNT;
            IF CHARACTR[ CHARXXXX].POSS.POSSCNT = 8 THEN
              EXIT( ITEMREWD);  (* IF RANDOM CHARACTER IS OK AND HAS 8 
                                   POSSESSIONS,  THEN EXIT !! *)
            CHARIIII := 0;
            WHILE (CALCULAT( 01, 100, 1) <
                                     REWARDM.REWDCALC.ITEM.PERCBIGR) AND
                  (CHARIIII < REWARDM.REWDCALC.ITEM.MAXTIMES) DO
              CHARIIII := CHARIIII + 1;
            ITEMINDX := REWARDM.REWDCALC.ITEM.MININDX +
               (CALCULATE( 1, REWARDM.REWDCALC.ITEM.RANGE, 1)) +
               (REWARDM.REWDCALC.ITEM.MFACTOR * CHARIIII);
            FOUNDITM( CHARXXXX, CHARIIII, ITEMINDX);
            PAUSE2
          END;  (* ITEMREWD *)
          
          
        BEGIN  (* GETREWRD *)
          IF REWARDM.REWDPERC < (RANDOM MOD 100) THEN
            EXIT( GETREWRD);
          IF REWARDM.BITEM = 0 THEN
            GOLDREWD
          ELSE
            ITEMREWD
        END;   (* GETREWRD *)
        
        
      PROCEDURE GIVEGOLD;  (* P010D1E *)
      
        BEGIN
          DIVLONG( GOLD2ONE, ALIVECNT);
          CLRRECT( 1, 11, 38, 4);
          MVCURSOR( 1, 12);
          PRINTSTR( 'EACH SHARE IS WORTH ');
          PRLONG2( GOLD2ONE);
          PRINTSTR( ' GP!');
          FOR INDX := 0 TO PARTYCNT - 1 DO
            IF CHARACTR[ INDX].STATUS = OK THEN
              ADDLONGS( CHARACTR[ INDX].GOLD, GOLD2ONE);
          PAUSE2
        END;  (* GIVEGOLD *)
        
        
      BEGIN (* CHSTGOLD *)
        FILLCHAR( GOLD2ONE, 6, 0);
        ENMYREWD;
        RDREWARD;
        UNITCLEAR( 1);
        IF REWARDZ.BCHEST AND (CHSTALRM <> 1) THEN
          BEGIN
            ACHEST;
            CLRRECT( 3, 5, 9, 5)
          END
        ELSE
          CHSTALRM := 0;
        CLRRECT( 1, 11, 38, 4);
        PIC2SCRN( GETREC( ZSPCCHRS, 19, 512));
        FOR INDX := 1 TO REWARDZ.REWRDCNT DO
          GETREWRD( REWARDZ.REWARDXX[ INDX]);
        GIVEGOLD
      END;  (* CHSTGOLD *)
    

(* ========================================================================== *)
(* DISK: Wiz1C.DSK | FILE: REWARDS2.TEXT                               *)
(* ========================================================================== *)

    
  PROCEDURE GIVEEXP;  (* P010D1F *)
  
    VAR
         WEPSTY3I : INTEGER;
         SPPCI    : INTEGER;
         BATRESLT : TBATRSLT;
         CHARXXX  : INTEGER;  (* MULTIPLE USES *)
         KILLEXP  : TWIZLONG; (* MULTIPLE USES *)
                  
                  
    PROCEDURE CNTALIVE;  (* P010D20 *)
    
      BEGIN
        ALIVECNT := 0;
        FOR LLBASE04 := 0 TO PARTYCNT - 1 DO
          IF CHARACTR[ LLBASE04].STATUS = OK THEN
            ALIVECNT := ALIVECNT + 1;
        IF ALIVECNT = 0 THEN
          BEGIN
            XGOTO := XCEMETRY;
            EXIT( REWARDS)
          END
      END;  (* CNTALIVE *)
      
      
    PROCEDURE CALC1EXP;  (* P010D21 *)
    
      VAR
            MULT2040 : INTEGER;
    
    
      PROCEDURE TOTALEXP;  (* P010D22 *)
      
        VAR
             ENEMYREC : TENEMY;
      
          PROCEDURE CALCKILL;  (* P010D23 *)
          
            VAR
                 KILLEXPX: TWIZLONG;
          
          
            PROCEDURE SETKILLX( AMOUNT : INTEGER);  (* P010D24 *)
            
              BEGIN (* SETKILLX *)
                KILLEXPX.HIGH := 0;
                KILLEXPX.MID  := 0;
                KILLEXPX.LOW  := AMOUNT
              END;  (* SETKILLX *)
              
              
            PROCEDURE MLTADDKX( MULTIPLY : INTEGER;  (* P010D25 *)
                                AMOUNT   : INTEGER);
                               
              BEGIN (* MLTADDKX *)
                IF MULTIPLY = 0 THEN
                  EXIT( MLTADDKX);
                SETKILLX( AMOUNT);
                WHILE MULTIPLY > 1 DO
                  BEGIN
                    MULTIPLY := MULTIPLY - 1;
                    ADDLONGS( KILLEXPX, KILLEXPX)
                  END;
                ADDLONGS( KILLEXP, KILLEXPX)
              END;  (* MLTADDKX *)
              
          
            BEGIN (* CALCKILL *)
              FILLCHAR( KILLEXP, 6, CHR( 0));
              FILLCHAR( KILLEXPX, 6, CHR( 0));
              SETKILLX( ENEMYREC.HPREC.LEVEL * ENEMYREC.HPREC.HPFAC);
              IF ENEMYREC.BREATHE = 0 THEN
                MULT2040:= 20
              ELSE
                MULT2040:= 40;
              MULTLONG( KILLEXPX, MULT2040);
              ADDLONGS( KILLEXP, KILLEXPX);
              MLTADDKX( ENEMYREC.MAGSPELS, 35);
              MLTADDKX( ENEMYREC.PRISPELS, 35);
              MLTADDKX( ENEMYREC.DRAINAMT, 200);
              MLTADDKX( ENEMYREC.HEALPTS, 90);
              
              SETKILLX( 40 * (11 - ENEMYREC.AC));
              ADDLONGS( KILLEXP, KILLEXPX);
              IF ENEMYREC.RECSN > 1 THEN
                MLTADDKX( ENEMYREC.RECSN, 30);
              IF ENEMYREC.UNAFFCT > 0 THEN
                MLTADDKX( (ENEMYREC.UNAFFCT DIV 10) + 1, 40);
              LLBASE04 := 0;
              FOR WEPSTY3I := 1 TO 6 DO
                IF ENEMYREC.WEPVSTY3[ WEPSTY3I] THEN
                  LLBASE04 := LLBASE04 + 1;
              MLTADDKX( LLBASE04, 35);
              LLBASE04 := 0;
              FOR SPPCI := 0 TO 6 DO
                IF ENEMYREC.SPPC[ SPPCI] THEN
                  LLBASE04 := LLBASE04 + 1;
              MLTADDKX( LLBASE04, 40)
            END;  (* CALCKILL *)
            
        BEGIN (* TOTALEXP *)
          MOVELEFT( IOCACHE[ GETREC( ZENEMY,
                                     BATRESLT.ENMYID[ CHARXXX],
                                     SIZEOF( TENEMY))],
                    ENEMYREC,
                    SIZEOF( TENEMY));
          CALCKILL;   (* KILLEXP := ENEMYREC.EXPAMT;  LOL *)

          MULTLONG( KILLEXP, BATRESLT.ENMYCNT[ CHARXXX]);
          ADDLONGS( EXPPERCH, KILLEXP)
        END;  (* TOTALEXP *)
      
      
      BEGIN  (* CALC1EXP *)
        FILLCHAR( EXPPERCH, 6, 0);
        FOR CHARXXX := 1 TO 4 DO
          IF BATRESLT.ENMYID[ CHARXXX] >= 0 THEN
            TOTALEXP;
        DIVLONG( EXPPERCH, ALIVECNT)
      END;   (* CALC1EXP *)
      
      
    PROCEDURE CHKDRAIN;  (* P010D26 *)
    
      VAR
           EXPTABLE : TEXP;
           
           
      PROCEDURE DROPLEVL( VAR CHAREXP:  TWIZLONG;  (* P010D27 *)
                              CURRLEVL: INTEGER;
                              CLASS:    TCLASS);
                         
        BEGIN
          MVCURSOR( 1, 13);
          PRINTSTR( 'HE HAD ');
          PRLONG2( CHAREXP);
          PRINTSTR( ' EP');
        
          CURRLEVL := CURRLEVL - 1;
          IF CURRLEVL = 0 THEN
            FILLCHAR( CHAREXP, 6, 0)
          ELSE
            IF CURRLEVL < 13 THEN
              CHAREXP := EXPTABLE[ CLASS][ CURRLEVL]
            ELSE
              BEGIN
                CHAREXP := EXPTABLE[ CLASS][ 12];
                FOR CHARXXX := 13 TO CURRLEVL DO
                  ADDLONGS( CHAREXP, EXPTABLE[ CLASS][ 0])
              END;
          ADDLONGS( CHAREXP, KILLEXP);
          MVCURSOR( 1, 14);
          PRINTSTR( 'HE HAS ');
          PRLONG2( CHAREXP);
          PRINTSTR( ' EP NOW');
          PAUSE2
        END;  (* DROPLEVL *)
        
        
      BEGIN (* CHKDRAIN *)
        MOVELEFT( IOCACHE[ GETREC( ZEXP, 0, SIZEOF( TEXP))],
                  EXPTABLE,
                  SIZEOF( TEXP));
        KILLEXP.HIGH := 0;
        KILLEXP.MID  := 0;
        KILLEXP.LOW  := 1;
        FOR CHARXXX := 0 TO PARTYCNT - 1 DO
          BEGIN
            IF  BATRESLT.DRAINED[ CHARXXX] THEN
              BEGIN
                CLRRECT( 1, 11, 38, 4);
                MVCURSOR( 1, 11);
                PRINTSTR( CHARACTR[ CHARXXX].NAME);
                PRINTSTR( ' WAS DRAINED!');
                DROPLEVL( CHARACTR[ CHARXXX].EXP,
                          CHARACTR[ CHARXXX].CHARLEV,
                          CHARACTR[ CHARXXX].CLASS)
              END
          END;
        CLRRECT( 1, 11, 38, 4);
        IF XGOTO = XREWARD2 THEN
          EXIT( GIVEEXP);
        FOR CHARXXX := 0 TO PARTYCNT - 1 DO
          IF CHARACTR[ CHARXXX].STATUS = OK THEN
            EXIT( CHKDRAIN);
        XGOTO := XCEMETRY;
        EXIT( REWARDS)
      END;  (* CHKDRAIN *)
      
      
    BEGIN  (* GIVEEXP *)
      MOVELEFT( IOCACHE, BATRESLT, SIZEOF( TBATRSLT));
      CACHEWRI := FALSE;
      CNTALIVE;
      CHKDRAIN;
      CALC1EXP;
      CLRRECT( 13, 1, 26, 4);
      MVCURSOR( 13, 1);
      PRINTSTR( 'FOR KILLING THE MONSTERS');
      MVCURSOR( 13, 2);
      PRINTSTR( 'EACH SURVIVOR GETS ');
      PRLONG2( EXPPERCH);
      MVCURSOR( 13, 3);
      PRINTSTR( 'EXPERIENCE POINTS');
      PAUSE2;
      FOR LLBASE04 := 0 TO PARTYCNT - 1 DO
        IF CHARACTR[ LLBASE04].STATUS = OK THEN
          ADDLONGS( CHARACTR[ LLBASE04].EXP, EXPPERCH)
    END;   (* GIVEEXP *)
  
  
  BEGIN  (* REWARDS *)
    
    CASE XGOTO OF
    
       XREWARD:  BEGIN
                   XGOTO := XRUNNER;
                   GIVEEXP;
                   CHSTGOLD
                 END;
                 
      XREWARD2:  BEGIN
                   GIVEEXP;
                   LLBASE04 := 0;
                   XGOTO := XSCNMSG
                 END
    END
  END;  (* REWARDS *)
  

(* ========================================================================== *)
(* DISK: Wiz1C.DSK | FILE: RUNNER.TEXT                                 *)
(* ========================================================================== *)

SEGMENT PROCEDURE RUNNER;     (* P010E01 *)
  
    CONST
         NORTH = 0;
         EAST  = 1;
         SOUTH = 2;
         WEST  = 3;
  
    VAR
         QUICKPLT : BOOLEAN;
         INITTURN : BOOLEAN;
         NEEDDRMZ : BOOLEAN;
         MAZE     : TMAZE;
         
         
    PROCEDURE DRAWMAZE;  (* P010E02 *)
    
      VAR
           GOTLIGHT : BOOLEAN;
           WALHEIGH : INTEGER;
           DOORFRAM : INTEGER;
           DOORWIDT : INTEGER; (* 1/2 DOOR WIDTH *)
           WALWIDTH : INTEGER; (* 1/2 WALL WIDTH *)
           
           (* IMAGINE A SMALLER BOX DRAWN INSIDE AN OUTER BOX.  THE OUTER BOX
              HAS UPPER LEFT CORNER AS 0,0 AND LOWER RIGHT CORNER AS 81,78.
              THE INSIDE BOX HAS COORDINATES (UL, UL) AND (LR, LR).       *)
              
           LR  : INTEGER; (* LOWER RIGHT INNER BOX BOUNDARY *)
           UL  : INTEGER; (* UPPER LEFT  INNER BOX BOUNDARY *)
           
           SQREDESC : INTEGER;
           XUPPER   : INTEGER;
           XLOWER   : INTEGER;
           
           Y4DRAW   : INTEGER;
           X4DRAW   : INTEGER;
           LIGHTDIS : INTEGER;
           WALLTYPE : TWALL;
    
        
      PROCEDURE SHFTPOS( VAR X:        INTEGER;  (* P010E03 *)
                         VAR Y:        INTEGER;
                             RIGHSHFT: INTEGER;
                             FRWDSHFT: INTEGER);
      
        BEGIN
          CASE DIRECTIO OF
            NORTH:  BEGIN
                      X := X + RIGHSHFT;
                      Y := Y + FRWDSHFT
                    END;
                    
             EAST:  BEGIN
                      X := X + FRWDSHFT;
                      Y := Y - RIGHSHFT
                    END;
                    
            SOUTH:  BEGIN
                      X := X - RIGHSHFT;
                      Y := Y - FRWDSHFT
                    END;
                    
             WEST:  BEGIN
                      X := X - FRWDSHFT;
                      Y := Y + RIGHSHFT
                    END;
          END;
          X := (X + 20) MOD 20;
          Y := (Y + 20) MOD 20
        END;  (* SHFTPOS *)
        
        
      
        FUNCTION FRWDVIEW( DELTAR: INTEGER) : TWALL;  (* P010E04 *)
        
          VAR
               Y : INTEGER;
               X : INTEGER;
               
          BEGIN
            X := X4DRAW;
            Y := Y4DRAW;
            SHFTPOS( X, Y, DELTAR, 0);
            CASE DIRECTIO OF
              NORTH:  FRWDVIEW := MAZE.N[ X][ Y];
               EAST:  FRWDVIEW := MAZE.E[ X][ Y];
              SOUTH:  FRWDVIEW := MAZE.S[ X][ Y];
               WEST:  FRWDVIEW := MAZE.W[ X][ Y];
            END
          END;  (* FRWDVIEW *)
          
          
        FUNCTION LEFTVIEW( DELTAR: INTEGER) : TWALL;  (* P010E05 *)
        
          VAR
               Y : INTEGER;
               X : INTEGER;
               
          BEGIN
            X := X4DRAW;
            Y := Y4DRAW;
            SHFTPOS( X, Y, DELTAR, 0);
            CASE DIRECTIO OF
              NORTH:  LEFTVIEW := MAZE.W[ X][ Y];
               EAST:  LEFTVIEW := MAZE.N[ X][ Y];
              SOUTH:  LEFTVIEW := MAZE.E[ X][ Y];
               WEST:  LEFTVIEW := MAZE.S[ X][ Y];
            END
          END;  (* LEFTVIEW *)
          
          
        FUNCTION RIGHVIEW( DELTAR: INTEGER) : TWALL;  (* P010E06 *) 
        
          VAR
               Y : INTEGER;
               X : INTEGER;
               
          BEGIN
            X := X4DRAW;
            Y := Y4DRAW;
            SHFTPOS( X, Y, DELTAR, 0);
            CASE DIRECTIO OF
              NORTH:  RIGHVIEW := MAZE.E[ X][ Y];
               EAST:  RIGHVIEW := MAZE.S[ X][ Y];
              SOUTH:  RIGHVIEW := MAZE.W[ X][ Y];
               WEST:  RIGHVIEW := MAZE.N[ X][ Y];
            END
          END;  (* RIGHVIEW *)
          
          
        PROCEDURE DRAWLEFT;  (* P010E07 *)
        
          BEGIN
            XLOWER := UL;
            DRAWLINE( UL, UL, -1, -1, WALWIDTH);             (* TOP EDGE *)
            DRAWLINE( UL, UL,  0,  1, WALHEIGH);             (* RIGHT EDGE *)
            DRAWLINE( UL, LR, -1,  1, WALWIDTH);             (* BOTTOM EDGE *)
            DRAWLINE( UL - WALWIDTH, UL - WALWIDTH,          (* LEFT EDGE *)
                               0,  1, WALHEIGH + WALHEIGH);
            IF (WALLTYPE = OPEN) OR
               (WALLTYPE = WALL) OR 
               ((WALLTYPE = HIDEDOOR) AND
                (NOT GOTLIGHT AND ((RANDOM MOD 6) <> 3))) THEN
              EXIT( DRAWLEFT);
              
            (* DRAW THE DOOR:  TOP, RIGHT, LEFT *)
              
            DRAWLINE( UL - DOORFRAM, UL, -1, -1, DOORWIDT);
            DRAWLINE( UL - DOORFRAM, UL,  0,  1, WALHEIGH + DOORFRAM);
            DRAWLINE( UL - DOORFRAM - DOORWIDT, UL - DOORWIDT, 0, 1,
                        WALHEIGH + WALWIDTH + DOORFRAM)
          END;
          
          
        PROCEDURE DRAWRIGH;  (* P010E08 *)
        
          BEGIN
            XUPPER := LR;
            DRAWLINE( LR, UL, 1, -1, WALWIDTH);
            DRAWLINE( LR, UL, 0,  1, WALHEIGH);
            DRAWLINE( LR, LR, 1,  1, WALWIDTH);
            DRAWLINE( LR + WALWIDTH, UL - WALWIDTH,
                              0,  1, WALHEIGH + WALHEIGH);
            IF (WALLTYPE = OPEN) OR
               (WALLTYPE = WALL) OR 
               ((WALLTYPE = HIDEDOOR) AND
                (NOT GOTLIGHT AND ((RANDOM MOD 6) <> 3))) THEN
              EXIT( DRAWRIGH);
              
            (* DRAW THE DOOR *)
              
            DRAWLINE( LR + DOORFRAM, UL, 1, -1, DOORWIDT);
            DRAWLINE( LR + DOORFRAM, UL, 0,  1,
                      WALHEIGH + DOORFRAM);
            DRAWLINE( LR + DOORFRAM + DOORWIDT, UL - DOORWIDT,
                                         0,  1, WALHEIGH + WALWIDTH + DOORFRAM)
          END;
          
          
        PROCEDURE DRAWFRNT( FRNTWALL : TWALL; LRCENT : INTEGER); (* P010E09 *)
        
        
          (* DRAW FRONT FACING WALL PANEL:  TOP, LEFT, RIGHT, BOTTOM.
             (WHY DOES RIGHT EDGE HAVE +1 FOR LENGTH???)              *)
        
          BEGIN
            DRAWLINE( UL + LRCENT, UL,            1, 0, WALHEIGH);
            DRAWLINE( UL + LRCENT, UL,            0, 1, WALHEIGH);
            DRAWLINE( UL + LRCENT + WALHEIGH, UL, 0, 1, WALHEIGH + 1);
            DRAWLINE( UL + LRCENT, UL + WALHEIGH, 1, 0, WALHEIGH);
            IF (FRNTWALL = OPEN) OR
               (FRNTWALL = WALL) OR 
               ((FRNTWALL = HIDEDOOR) AND
                (NOT GOTLIGHT AND ((RANDOM MOD 6) <> 3))) THEN
              EXIT( DRAWFRNT);
              
            (* DRAW DOOR:  LEFT, RIGHT, TOP *)
             
            DRAWLINE( UL + LRCENT + DOORFRAM, LR,
                        0, -1, WALWIDTH + DOORWIDT + DOORFRAM);
                        
            DRAWLINE( UL + LRCENT + WALWIDTH + DOORWIDT + DOORFRAM, LR,
                        0, -1, WALWIDTH + DOORWIDT + DOORFRAM);
                        
            DRAWLINE( UL + LRCENT + DOORFRAM,
                        LR - WALWIDTH - DOORWIDT- DOORFRAM,
                        1,  0, WALWIDTH + DOORWIDT + 1)
          END;
          
        
      BEGIN (* DRAWMAZE *)
        GOTLIGHT := LIGHT > 0;
        IF GOTLIGHT THEN
          BEGIN
            IF QUICKPLT THEN
              LIGHTDIS := 3
            ELSE
                LIGHTDIS := 5;
            LIGHT := LIGHT - 1
          END
        ELSE
          LIGHTDIS := 2;
        
        UL :=  8;
        LR := 72;
        WALWIDTH := 32;
        DOORWIDT := 16;
        DOORFRAM :=  8;
        WALHEIGH := 64;
        
        X4DRAW := MAZEX;
        Y4DRAW := MAZEY;
        CLEARPIC;
        XLOWER := 0;
        XUPPER := 81;
        WHILE LIGHTDIS > 0 DO
          BEGIN
            SQREDESC := MAZE.SQREXTRA[ X4DRAW][ Y4DRAW];
            IF MAZE.SQRETYPE[ SQREDESC] = DARK THEN
              EXIT( DRAWMAZE)
            ELSE
              IF MAZE.SQRETYPE[ SQREDESC] = TRANSFER THEN
                IF MAZE.AUX0[ SQREDESC] = MAZELEV THEN
                  BEGIN
                    X4DRAW := MAZE.AUX2[ SQREDESC];
                    Y4DRAW := MAZE.AUX1[ SQREDESC]
                  END;
            
            CLRPICT( XLOWER, 0, XUPPER, 79);
            
              (* $0679 := XLOWER
                 $06F9 := 0
                 $0779 := XUPPER
                 $07F9 := 79
                 
                 THESE MEMORY LOCATIONS ARE ACCESSED BY DRAWLINE.
                 
                 WITH THESE PARAMETERS, THERE IS NO PICTURE CLEARING. *)
            
            WALLTYPE := LEFTVIEW( 0);
            IF WALLTYPE <> OPEN THEN
                DRAWLEFT
            ELSE
              BEGIN
                WALLTYPE := FRWDVIEW( -1);  (* STEP LEFT ONE SQUARE *)
                IF WALLTYPE <> OPEN THEN
                  BEGIN
                    DRAWFRNT( WALLTYPE, -( 2 * WALWIDTH));
                    XLOWER := UL
                  END;
              END;
            
            WALLTYPE := RIGHVIEW( 0);
            IF WALLTYPE <> OPEN THEN
              DRAWRIGH
            ELSE
              BEGIN
                WALLTYPE := FRWDVIEW( 1);  (* STEP RIGHT ONE SQUARE *)
                IF WALLTYPE <> OPEN THEN
                  BEGIN
                    DRAWFRNT( WALLTYPE, 2 * WALWIDTH);
                    XUPPER := LR
                  END;
              END;
            
            WALLTYPE := FRWDVIEW( 0);
            IF WALLTYPE <> OPEN THEN
              BEGIN
                DRAWFRNT( WALLTYPE, 0);
                EXIT( DRAWMAZE)
              END;
            
            WALWIDTH := WALWIDTH DIV 2;
            DOORWIDT := WALWIDTH DIV 2;
            WALHEIGH := WALWIDTH * 2;
            DOORFRAM := WALWIDTH DIV 4;
            UL := UL + WALWIDTH;
            LR := LR - WALWIDTH;
            
            SHFTPOS( X4DRAW, Y4DRAW, 0, 1);  (* STEP FORWARD *)
            LIGHTDIS := LIGHTDIS - 1
              
          END; (* WHILE *)
      END;  (* DRAWMAZE *)

(* ========================================================================== *)
(* DISK: Wiz1C.DSK | FILE: RUNNER2.TEXT                                *)
(* ========================================================================== *)

    
    PROCEDURE READMAZE;  (* P010E0A *)
    
      BEGIN
        MOVELEFT( IOCACHE[ GETREC( ZMAZE, MAZELEV - 1, SIZEOF( TMAZE))],
                  MAZE,
                  SIZEOF( TMAZE))
      END;
      
    
    PROCEDURE PRSTATS;  (* P010E0B *)
    
      VAR
          SAVE1    : INTEGER;
          TEMPX    : INTEGER;  (* MULTIPLE USES *)
          CHARX    : INTEGER;
          CHARREC  : TCHAR;
          ANYALIVE : BOOLEAN;
    
    
      PROCEDURE PRSTATUS;  (* P010E0C *)
      
        BEGIN
          IF CHARACTR[ CHARX].STATUS = OK THEN
            BEGIN
              ANYALIVE := TRUE;
              IF CHARACTR[ CHARX].LOSTXYL.POISNAMT[ 1] = 0 THEN
                PRINTNUM( CHARACTR[ CHARX].HPMAX, 4)
              ELSE
                PRINTSTR( 'POISON')
            END
          ELSE
            PRINTSTR( SCNTOC.STATUS[ CHARACTR[ CHARX].STATUS])
        END;  (* PRSTATUS *)
        
        
      BEGIN  (* PRSTATS *)
        FOR CHARX := 0 TO PARTYCNT - 2 DO
          BEGIN
            FOR TEMPX := CHARX + 1 TO PARTYCNT - 1 DO
              BEGIN
                IF CHARACTR[ CHARX].STATUS > CHARACTR[ TEMPX].STATUS THEN
                  BEGIN
                    CHARREC := CHARACTR[ CHARX];
                    CHARACTR[ CHARX] := CHARACTR[ TEMPX];
                    CHARACTR[ TEMPX] := CHARREC;
                    
                    SAVE1 := CHARDISK[ CHARX];
                    CHARDISK[ CHARX] := CHARDISK[ TEMPX];
                    CHARDISK[ TEMPX] := SAVE1
                  END
              END;
          END;
          
        CLRRECT( 1, 17, 38, 6);
      
        ANYALIVE := FALSE;
        FOR CHARX := 0 TO PARTYCNT - 1 DO
          BEGIN
          
            WITH CHARACTR[ CHARX] DO
              BEGIN
                MVCURSOR( 1, 17 + CHARX);
                PRINTNUM( CHARX + 1, 1);
                PRINTSTR( ' ');
                PRINTSTR( NAME);
                MVCURSOR( 19, 17 + CHARX);
                PRINTSTR( COPY( SCNTOC.ALIGN[ CHARACTR[ CHARX].ALIGN], 1, 1));
                PRINTCHR( '-');
                PRINTSTR( COPY( SCNTOC.CLASS[ CLASS], 1, 3));
                LLBASE04 := ARMORCL - ACMOD2;
                IF LLBASE04 >= 0 THEN
                  PRINTNUM( LLBASE04, 3)
                ELSE
                  IF LLBASE04 > - 10 THEN
                    BEGIN
                      PRINTSTR( ' -');
                      PRINTNUM( ABS( LLBASE04), 1)
                    END
                  ELSE
                    PRINTSTR( ' LO');
                IF STATUS >= DEAD THEN
                  HPLEFT := 0;
                  
                PRINTNUM( HPLEFT, 5);
                TEMPX := CHARACTR[ CHARX].HEALPTS -
                           CHARACTR[ CHARX].LOSTXYL.POISNAMT[ 1];
                IF TEMPX = 0 THEN
                  PRINTCHR( ' ')
                ELSE IF TEMPX < 0 THEN
                  PRINTCHR( '-')
                ELSE
                  PRINTCHR( '+');
                PRSTATUS;
              END;  (* 'WITH' *)
          END;  (* 'FOR' *)
              
          IF NOT ANYALIVE THEN
            BEGIN
              XGOTO := XCEMETRY;
              EXIT( RUNNER)
            END
          
      END;   (* PRSTATS *)
      
      
      
    PROCEDURE ENCOUNTR;  (* P010E0D *)
    
      VAR
           ENCTYPE  : INTEGER;
           ENEMYI   : INTEGER;
           ENCCALC  : INTEGER;
    
      BEGIN
        ENCB4RUN := TRUE;
        CLRRECT( 1, 11, 38, 4);
        MVCURSOR( 14, 12);
        PRINTSTR( 'AN ENCOUNTER');
        ENCTYPE := 1;
        WHILE ((RANDOM MOD 4) = 2) AND (ENCTYPE < 3) DO
          ENCTYPE := ENCTYPE + 1;
        WITH MAZE.ENMYCALC[ ENCTYPE] DO
          BEGIN
            ENCCALC := 0;
            WHILE ((RANDOM MOD 100) < PERCWORS) AND
                   (ENCCALC < WORSE01) DO
              ENCCALC := ENCCALC + 1;
            ENEMYI := MINENEMY +
                        (RANDOM MOD RANGE0N) +
                        (MULTWORS * ENCCALC);
            IF CHSTALRM = 1 THEN
              ATTK012 := 2
            ELSE
              IF MAZE.FIGHTS[ MAZEX][ MAZEY] = 1 THEN
                IF FIGHTMAP[ MAZEX][ MAZEY] THEN
                  ATTK012 := 2
                ELSE
                  ATTK012 := 1
              ELSE
                ATTK012 := 0;
            ENEMYINX := ENEMYI;
            XGOTO := XCOMBAT;
            EXIT( RUNNER)
          END
      END;  (* ENCOUNTR *)
      
      
    PROCEDURE RUNMAIN;  (* P010E0E *)
    
    
      PROCEDURE EXITRUN( MAZELVL: INTEGER);  (* P010E0F *)
      
        BEGIN
          MAZELEV := MAZELVL;
          CLEARPIC;
          XGOTO := XNEWMAZE;
          EXIT( RUNNER)
        END;  (* EXITRUN *)
        
        
      PROCEDURE SPECSQAR;  (* P010E10 *)
      
        VAR
             SQTYPE : INTEGER;
      
      
        PROCEDURE SPINDIR;  (* P010E11 *)
        
          BEGIN
            DIRECTIO := RANDOM MOD 4;
            DRAWMAZE
          END;
          
          
        PROCEDURE QUIETXFR;  (* P010E12 *)
        
          BEGIN
            MAZEX := MAZE.AUX2[ SQTYPE];
            MAZEY := MAZE.AUX1[ SQTYPE];
            IF MAZELEV <> MAZE.AUX0[ SQTYPE] THEN
              EXITRUN( MAZE.AUX0[ SQTYPE])
          END;  (* QUIETXFR *)
          
          
        PROCEDURE ACHUTE;  (* P010E13 *)
        
          BEGIN
            PRINTSTR( 'A CHUTE!');
            QUIETXFR
          END;
          
          
        PROCEDURE STAIRSYN;  (* P010E14 *)
        
          BEGIN
            PRINTSTR( 'STAIRS GOING ');
            IF MAZELEV > MAZE.AUX0[ SQTYPE] THEN
              PRINTSTR( 'UP.')
            ELSE
              PRINTSTR( 'DOWN.');
            MVCURSOR( 1, 12);
            PRINTSTR( 'TAKE THEM (Y/N) ?');
            REPEAT
              GETKEY
            UNTIL (INCHAR = 'Y') OR (INCHAR = 'N');
            IF INCHAR = 'Y' THEN
              QUIETXFR
          END;  (* STAIRSYN *)
          
          
        PROCEDURE VERYDARK;  (* P010E15 *)
        
          BEGIN
            MVCURSOR( 2, 5);
            PRINTSTR( 'IT''S VERY');
            MVCURSOR( 2, 6);
            PRINTSTR( 'DARK HERE');
            LIGHT := 0
          END;  (* VERYDARK *)
          
          
        PROCEDURE ROCKWATR;  (* P010E16 *)
        
          VAR
               HPDAM   : INTEGER;
               HPTIMES : INTEGER;
               PARTYI  : INTEGER;
            
          BEGIN (* ROCKWATR *)
            WRITE( CHR( 7));
            PAUSE2;
            FOR PARTYI := 0 TO PARTYCNT - 1 DO
              BEGIN
                IF CHARACTR[ PARTYI].STATUS < DEAD THEN
                  BEGIN
                    IF ((RANDOM MOD 25) + MAZELEV) > 
                       CHARACTR[ PARTYI].ATTRIB[ AGILITY] THEN
                      BEGIN
                        HPDAM := MAZE.AUX0[ SQTYPE];
                        FOR HPTIMES := 1 TO MAZE.AUX2[ SQTYPE] DO
                          HPDAM := HPDAM + (RANDOM MOD MAZE.AUX1[ SQTYPE]) + 1;
                        CHARACTR[ PARTYI].HPLEFT := CHARACTR[ PARTYI].HPLEFT -
                                                                         HPDAM;
                        IF CHARACTR[ PARTYI].HPLEFT < 0 THEN
                          BEGIN
                            CHARACTR[ PARTYI].HPLEFT := 0;
                            CHARACTR[ PARTYI].STATUS := DEAD;
                            CLRRECT( 1, 11, 38, 1);
                            MVCURSOR( 1, 11);
                            PRINTSTR( CHARACTR[ PARTYI].NAME);
                            PRINTSTR( ' DIED');
                            PAUSE2
                          END;
                      END;
                  END;
              END;
            PRSTATS
          END;  (* ROCKWATR *)
        
          
        PROCEDURE APIT;  (* P010E17 *)
        
          BEGIN
            PRINTSTR( 'A PIT!');
            ROCKWATR
          END;
          
          
        PROCEDURE OUCH;  (* P010E18 *)
        
          BEGIN
            PRINTSTR( 'OUCH!');
            ROCKWATR
          END;
          
          
        PROCEDURE DOSCNMSG;  (* P010E19 *)
        
          BEGIN
            LLBASE04 := SQTYPE;
            XGOTO := XSCNMSG;
            XGOTO2 := XRUNNER;
            EXIT( RUNNER)
          END;  (* DOSCNMSG *)
          
          
        PROCEDURE CHENCOUN;  (* P010E1A *)
        
          VAR
               UNUSEDXX : INTEGER;
               UNUSEDYY : INTEGER;
        
          BEGIN
            IF MAZE.AUX0[ SQTYPE] = 0 THEN
              EXIT( CHENCOUN);
            IF NOT FIGHTMAP[ MAZEX][ MAZEY] THEN
              EXIT( CHENCOUN);
            MVCURSOR( 14, 12);
            PRINTSTR( 'AN ENCOUNTER');
            ENCB4RUN := FALSE;
            ATTK012 := 2;
            XGOTO := XCOMBAT;
            ENEMYINX := MAZE.AUX2[ SQTYPE];
            IF MAZE.AUX1[ SQTYPE] > 1 THEN
              ENEMYINX := ENEMYINX + (RANDOM MOD MAZE.AUX1[ SQTYPE]);
            IF MAZE.AUX0[ SQTYPE] > 0 THEN
              BEGIN
                MAZE.AUX0[ SQTYPE] := MAZE.AUX0[ SQTYPE] - 1;
                IF MAZE.AUX0[ SQTYPE] = 0 THEN
                  MAZE.SQRETYPE[ SQTYPE] := NORMAL;
                MOVELEFT( MAZE,  
                          IOCACHE[ GETRECW( ZMAZE, MAZELEV - 1, SIZEOF( TMAZE))],
                          SIZEOF( TMAZE));
              END;
            EXIT( RUNNER)
          END;  (* CHENCOUN *)
          
          
        PROCEDURE BUTTONS;  (* P010E1B *)
        
          VAR
               MAXBUT   : INTEGER;
               MINBUT   : INTEGER;
               UNUSEDXX : INTEGER;
               UNUSEDYY : INTEGER;
               
          BEGIN
            MINBUT := MAZE.AUX2[ SQTYPE];
            MAXBUT := MAZE.AUX1[ SQTYPE];
            PRINTSTR( 'THERE ARE BUTTONS ON THE WALL');
            MVCURSOR( 1, 12);
            PRINTSTR( 'MARKED A THROUGH ');
            PRINTCHR( CHR( ORD('A') + MAXBUT - MINBUT));
            PRINTCHR( '.');
            MVCURSOR( 1, 14);
            PRINTSTR( 'PRESS ONE (OR RETURN TO LEAVE THEM)');
            REPEAT
              GETKEY
            UNTIL (INCHAR = CHR( CRETURN)) OR 
                  ( (INCHAR >= 'A') AND 
                    (INCHAR <= CHR( ORD('A') + MAXBUT - MINBUT)));
            CLRRECT( 1, 11, 38, 4);
            IF INCHAR = CHR( CRETURN) THEN
              EXIT( BUTTONS);
            IF MAZE.AUX0[ SQTYPE] > 0 THEN
              BEGIN
                MAZEX := RANDOM MOD 20;
                MAZEY := RANDOM MOD 20
              END;
            EXITRUN( MINBUT + ORD( INCHAR) - ORD( 'A'))
          END;  (* BUTTONS *)
          
          
        BEGIN  (* SPECSQAR *)
          CLRRECT( 1, 11, 38, 4);
          MVCURSOR( 1, 11);
          SQTYPE := MAZE.SQREXTRA[ MAZEX][ MAZEY];
          FIZZLES := 0;
          NEEDDRMZ:= TRUE;
          CASE MAZE.SQRETYPE[ SQTYPE] OF
          
              FIZZLE:  FIZZLES := 1;
              
            ROCKWATE:  BEGIN
                         MAZELEV := -99;
                         XGOTO := XNEWMAZE;
                         EXIT( RUNNER)
                       END;
                       
             BUTTONZ:  BUTTONS;
             
              STAIRS:  IF INITTURN THEN
                         STAIRSYN;
                         
                 PIT:  IF INITTURN THEN
                         APIT;
                         
               OUCHY:  OUCH;
               
               CHUTE:  ACHUTE;
               
             SPINNER:  IF INITTURN THEN
                         SPINDIR;
            TRANSFER:  QUIETXFR;
            
                DARK:  VERYDARK;
                
              SCNMSG:  DOSCNMSG;
              
            ENCOUNTE:  CHENCOUN;
          END
        END;   (* SPECSQAR *)
      

    PROCEDURE UPDATEHP;  (* P010E1C *)
    
      VAR
           UNUSEDXX : INTEGER;
           CHARX    : INTEGER;
           
      BEGIN
        FOR CHARX := 0 TO PARTYCNT - 1 DO
          WITH CHARACTR[ CHARX] DO
            BEGIN
            
              IF (RANDOM MOD 4) = 2 THEN
                HPLEFT := HPLEFT - LOSTXYL.POISNAMT[ 1] + HEALPTS;
              IF HPLEFT <= 0 THEN
                BEGIN
                  LOSTXYL.POISNAMT[ 1] := 0;
                  IF STATUS < DEAD THEN
                    BEGIN
                      MVCURSOR( 1, 11);
                      PRINTSTR( NAME);
                      PRINTSTR( ' DIED');
                      PAUSE2;
                      CLRRECT( 1, 11, 38, 1);
                      HPLEFT := 0;
                      STATUS := DEAD;
                      PRSTATS
                    END
                END
              ELSE
                IF HPLEFT > HPMAX THEN
                  HPLEFT := HPMAX
            END
      END;  (* UPDATEHP *)
      
      
      PROCEDURE MOVEFRWD;  (* P010E1D *)
      
        BEGIN
          NEEDDRMZ := TRUE;
          INITTURN := TRUE;
          SAVEX    := MAZEX;
          SAVEY    := MAZEY;
          SAVELEV  := MAZELEV;
          CASE DIRECTIO OF
            NORTH:  MAZEY := MAZEY + 1;
             EAST:  MAZEX := MAZEX + 1;
            SOUTH:  MAZEY := MAZEY - 1;
             WEST:  MAZEX := MAZEX - 1;
          END;
          MAZEY := (MAZEY + 20) MOD 20;
          MAZEX := (MAZEX + 20) MOD 20
        END;  (* MOVEFRWD *)
        
        
      PROCEDURE BUMPWALL;  (* P010E1E *)
      
        BEGIN
          CLRRECT( 4, 3, 5, 1);
          MVCURSOR( 4, 3);
          PRINTSTR( 'OUCH!');
          WRITE( CHR( 7))
        END;
        
        
      PROCEDURE FORWRD;  (* P010E1F *)
      
        BEGIN
          CASE DIRECTIO OF
            NORTH:  IF MAZE.N[ MAZEX][ MAZEY] = OPEN THEN
                      MOVEFRWD;
                      
             EAST:  IF MAZE.E[ MAZEX][ MAZEY] = OPEN THEN
                      MOVEFRWD;
                      
            SOUTH:  IF MAZE.S[ MAZEX][ MAZEY] = OPEN THEN
                      MOVEFRWD;
                      
             WEST:  IF MAZE.W[ MAZEX][ MAZEY] = OPEN THEN
                      MOVEFRWD;
          END;
          IF NOT INITTURN THEN
            BUMPWALL
        END;  (* FORWRD *)
        
        
      PROCEDURE KICK;  (* P010E20 *)
      
        BEGIN
          CASE DIRECTIO OF
            NORTH:  IF MAZE.N[ MAZEX][ MAZEY] <> WALL THEN
                      MOVEFRWD;
                      
             EAST:  IF MAZE.E[ MAZEX][ MAZEY] <> WALL THEN
                      MOVEFRWD;
                      
            SOUTH:  IF MAZE.S[ MAZEX][ MAZEY] <> WALL THEN
                      MOVEFRWD;
                      
             WEST:  IF MAZE.W[ MAZEX][ MAZEY] <> WALL THEN
                      MOVEFRWD;
          END;
          IF NOT INITTURN THEN
            BUMPWALL
        END;  (* KICK *)
        
        
      PROCEDURE DOTURN( LEFTRIGH: INTEGER);  (* P010E21 *)
      
        BEGIN
          NEEDDRMZ := TRUE;
          DIRECTIO := (DIRECTIO + LEFTRIGH) MOD 4
        END;
        
        
      PROCEDURE SETTIME;  (* P010E22 *)
      
        VAR
             TIMEVAL : INTEGER;
             TIMESTR : STRING;
      
        PROCEDURE EXITTIME;  (* P010E23 *)
        
          BEGIN
            CLRRECT( 1, 13, 38, 1);
            EXIT( SETTIME)
          END;
          
          
        BEGIN  (* SETTIME *)
          MVCURSOR( 1, 13);
          PRINTSTR( 'NEW DELAY (1-5000) >');
          GETSTR( TIMESTR, 21, 13);
          TIMEVAL := 0;
          IF LENGTH( TIMESTR) > 4 THEN
            EXITTIME;
          FOR LLBASE04 := 1 TO LENGTH( TIMESTR) DO
            IF (TIMESTR[ LLBASE04] >= '0') AND
               (TIMESTR[ LLBASE04] <= '9') THEN
              TIMEVAL := 10 * TIMEVAL + ORD( TIMESTR[ LLBASE04]) - ORD( '0')
            ELSE
              EXITTIME;
          IF (TIMEVAL > 0) AND
             (TIMEVAL <= 5000) THEN
               TIMEDLAY := TIMEVAL;
          EXITTIME
        END;  (* SETTIME *)
        
        
      PROCEDURE QUIKPLOT;  (* P010E24 *)
      
        BEGIN
          MVCURSOR( 1, 13);
          PRINTSTR( 'QUICK PLOT ');
          QUICKPLT := NOT QUICKPLT;
          IF QUICKPLT THEN
            PRINTSTR( 'ON')
          ELSE
            PRINTSTR( 'OFF');
          DRAWMAZE;
          CLRRECT( 1, 13, 38, 1)
        END;
        
        
      PROCEDURE RUNINIT;  (* P010E25 *)
      
        BEGIN
          CLRRECT( 13, 1, 26, 4);
          CLRRECT( 13, 6, 26, 4);
          MVCURSOR( 13, 1);
          PRINTSTR( 'F)ORWARD  C)AMP    S)TATUS');
          MVCURSOR( 13, 2);
          PRINTSTR( 'L)EFT     Q)UICK   A<-W->D');
          MVCURSOR( 13, 3);
          PRINTSTR( 'R)IGHT    T)IME    CLUSTER');
          MVCURSOR( 13, 4);
          PRINTSTR( 'K)ICK     I)NSPECT');
          MVCURSOR( 13, 7);
          PRINTSTR( 'SPELLS :');
          GRAPHICS;
          PRSTATS;
          NEEDDRMZ := TRUE;
          INITTURN := TRUE
        END;  (* RUNINIT *)
    
    
      BEGIN (* RUNMAIN *)
        RUNINIT;
        REPEAT
          MVCURSOR( 22, 7);
          IF LIGHT > 0 THEN
            PRINTSTR( 'LIGHT')
          ELSE
            PRINTSTR( '     ');
            
          MVCURSOR( 22, 8);
          IF ACMOD2 > 0 THEN
            PRINTSTR( 'PROTECT')
          ELSE
            PRINTSTR( '       ');
            
          IF NEEDDRMZ THEN
            DRAWMAZE;
          IF MAZE.SQRETYPE[ MAZE.SQREXTRA[ MAZEX][ MAZEY]] <> NORMAL THEN
            IF XGOTO2 <> XSCNMSG THEN
              IF INITTURN THEN
                SPECSQAR;
          IF XGOTO2 <> XSCNMSG THEN
            IF INITTURN THEN
              CLRRECT( 1, 11, 38, 4);
          XGOTO2 := XRUNNER;
          NEEDDRMZ := FALSE;
          
          IF (((RANDOM MOD 99) = 35)      OR
              (CHSTALRM = 1)              OR
              (FIGHTMAP[ MAZEX][ MAZEY])) OR
             
             (INITTURN AND (INCHAR = CHR( 75)) AND
             (MAZE.FIGHTS[ MAZEX][ MAZEY] = 1)) AND
             ((RANDOM MOD 8) = 3)
          THEN
            ENCOUNTR;
            
          IF INITTURN THEN
            UPDATEHP;
          INITTURN := FALSE;
          
          GETKEY;
          CASE INCHAR OF
          
            'F', 'W':  FORWRD;
            
            'A', 'L':  DOTURN( 3);
            
            'D', 'R':  DOTURN( 1);
            
                 'K':  KICK;
                 
                 'S':  PRSTATS;
                 
                 'T':  SETTIME;
                 
                 'Q':  QUIKPLOT;
                 
                 'C':  BEGIN
                         XGOTO := XINSPCT2;
                         WRITE( CHR( 12));
                         EXIT( RUNNER)
                       END;
                       
                 'I':  BEGIN
                         XGOTO := XINSAREA;
                         WRITE( CHR( 12));
                         EXIT( RUNNER)
                       END;
          END
        UNTIL FALSE
      END;  (* RUNMAIN *)
      
      
    PROCEDURE CLROOMFG( XLOOP: INTEGER;  (* P010026 *)
                        YLOOP: INTEGER);
    
           
      BEGIN  (* CLROOMFG *)
        XLOOP := (XLOOP + 20) MOD 20;
        YLOOP := (YLOOP + 20) MOD 20;
        IF NOT FIGHTMAP[ XLOOP][ YLOOP] THEN
          EXIT( CLROOMFG);
          
        FIGHTMAP[ XLOOP][ YLOOP] := FALSE;
        
        IF MAZE.N[ XLOOP][ YLOOP] = OPEN THEN
          CLROOMFG( XLOOP, YLOOP + 1);
        IF MAZE.E[ XLOOP][ YLOOP] = OPEN THEN
          CLROOMFG( XLOOP + 1, YLOOP);
        IF MAZE.S[ XLOOP][ YLOOP] = OPEN THEN
          CLROOMFG( XLOOP, YLOOP - 1);
        IF MAZE.W[ XLOOP][ YLOOP] = OPEN THEN
          CLROOMFG( XLOOP - 1, YLOOP);
      END;   (* CLROOMFG *)
      
      
      
    BEGIN  (* RUNNER *)
      QUICKPLT := FALSE;
      READMAZE;
      CLROOMFG( MAZEX, MAZEY);
      REPEAT
        RUNMAIN
      UNTIL FALSE
    END;
  

(* ========================================================================== *)
(* DISK: Wiz1A.DSK | FILE: WIZ2.TEXT                                   *)
(* ========================================================================== *)


  PROCEDURE PRINTBEL;  (* P010002 *)
  
    BEGIN
      WRITE( CHR( 7));
      WRITE( CHR( 7));
      WRITE( CHR( 7))
    END;


  FUNCTION GETREC;  (* P010003 *)
  
    VAR
         BUFFADDR : INTEGER;
         DSKBLOCK : INTEGER;
                        
    BEGIN
      DSKBLOCK := SCNTOC.BLOFF[ DATATYPE] +
                  2 *  (DATAINDX DIV SCNTOC.RECPER2BL[ DATATYPE]);
      BUFFADDR := DATASIZE * (DATAINDX MOD SCNTOC.RECPER2BL[ DATATYPE]);
      IF CACHEBL <> DSKBLOCK THEN
        BEGIN
          IF CACHEWRI THEN
            REPEAT
              UNITWRITE( DRIVE1, IOCACHE, SIZEOF( IOCACHE),
                         (CACHEBL + SCNTOCBL), 0)
            UNTIL IORESULT = 0;
          CACHEWRI := FALSE;
          CACHEBL := DSKBLOCK;
          REPEAT
            UNITREAD( DRIVE1, IOCACHE, SIZEOF( IOCACHE),
                      (CACHEBL + SCNTOCBL), 0)
          UNTIL IORESULT = 0
        END;
      GETREC := BUFFADDR
    END;
         

  FUNCTION GETRECW;  (* P010004 *)
    
    VAR
         BUFFADDR : INTEGER;
         DSKBLOCK : INTEGER;
                        
    BEGIN
    
      DSKBLOCK := SCNTOC.BLOFF[ DATATYPE] +
                  2 *  (DATAINDX DIV SCNTOC.RECPER2BL[ DATATYPE]);
      BUFFADDR := DATASIZE * (DATAINDX MOD SCNTOC.RECPER2BL[ DATATYPE]);
      IF CACHEBL <> DSKBLOCK THEN
        BEGIN
          IF CACHEWRI THEN
            REPEAT
              UNITWRITE( DRIVE1, IOCACHE, SIZEOF( IOCACHE),
                         (CACHEBL + SCNTOCBL), 0)
            UNTIL IORESULT = 0;
          CACHEBL := DSKBLOCK;
          REPEAT
            UNITREAD( DRIVE1, IOCACHE, SIZEOF( IOCACHE),
                      (CACHEBL + SCNTOCBL), 0)
          UNTIL IORESULT = 0;
        END;
      CACHEWRI := TRUE;
      GETRECW := BUFFADDR
    END;
    
    
  PROCEDURE ADDLONGS;  (* P010005 *)
  
    BEGIN
      FIRST.LOW := FIRST.LOW + SECOND.LOW;
      IF FIRST.LOW >= 10000 THEN
        BEGIN
          FIRST.MID := FIRST.MID + 1;
          FIRST.LOW := FIRST.LOW - 10000
        END;
        
      FIRST.MID := FIRST.MID + SECOND.MID;
      IF FIRST.MID >= 10000 THEN
        BEGIN
          FIRST.HIGH := FIRST.HIGH + 1;
          FIRST.MID := FIRST.MID - 10000
        END;
        
      FIRST.HIGH := FIRST.HIGH + SECOND.HIGH;
      IF FIRST.HIGH >= 10000 THEN
        BEGIN
          FIRST.HIGH := 9999;
          FIRST.MID  := 9999;
          FIRST.LOW  := 9999
        END
    END;
    
    
  PROCEDURE SUBLONGS;  (* P010006 *)
  
    BEGIN
      FIRST.LOW := FIRST.LOW - SECOND.LOW;
      IF FIRST.LOW < 0 THEN
        BEGIN
          FIRST.MID := FIRST.MID - 1;
          FIRST.LOW := FIRST.LOW + 10000
        END;
      
      FIRST.MID := FIRST.MID - SECOND.MID;
      IF FIRST.MID < 0 THEN
        BEGIN
          FIRST.HIGH := FIRST.HIGH - 1;
          FIRST.MID := FIRST.MID + 10000
        END;
        
      FIRST.HIGH := FIRST.HIGH - SECOND.HIGH;
      IF FIRST.HIGH < 0 THEN
        BEGIN
          FIRST.HIGH := 0;
          FIRST.MID  := 0;
          FIRST.LOW  := 0
        END
    END;


  PROCEDURE LONG2BCD;  (* P010008 *)
  
    VAR
         DIGITX : INTEGER;
  
  
    PROCEDURE INT2BCD( PARTLONG: INTEGER);  (* P010021 *)
    
      PROCEDURE PUTDIGIT( POWOF10: INTEGER);  (* P010022 *)
      
        BEGIN
          BCDNUM[ DIGITX] := PARTLONG DIV POWOF10;
          DIGITX := DIGITX + 1;
          PARTLONG := PARTLONG MOD POWOF10
        END;
    
    
      BEGIN  (* INT2BCD *)
        PUTDIGIT( 1000);
        PUTDIGIT(  100);
        PUTDIGIT(   10);
        PUTDIGIT(    1)
      END;   (* INT2BCD *)
      
      
    BEGIN  (* LONG2BCD *)
      BCDNUM[ 0] := 0;
      DIGITX := 1;
      INT2BCD( LONGNUM.HIGH);
      INT2BCD( LONGNUM.MID);
      INT2BCD( LONGNUM.LOW)
    END;  (* LONG2BCD *)


  PROCEDURE BCD2LONG;  (* P010007 *)
  
    VAR
         DIGITX : INTEGER;
  
  
    PROCEDURE BCD2INT( VAR LONGPART: INTEGER);  (* P010023 *)
  
  
      PROCEDURE GETDIGIT;  (* P010024 *)
      
        BEGIN
          LONGPART := (10 * LONGPART) + BCDNUM[ DIGITX];
          DIGITX := DIGITX + 1
        END;
        
        
      BEGIN  (* BCD2INT *)
        LONGPART := 0;
        GETDIGIT;
        GETDIGIT;
        GETDIGIT;
        GETDIGIT
      END;
      
      
    BEGIN  (* BCD2LONG *)
      FILLCHAR( LONGNUM, 6, 0);
      DIGITX := 1;
      BCD2INT( LONGNUM.HIGH);
      BCD2INT( LONGNUM.MID);
      BCD2INT( LONGNUM.LOW)
    END;  (* BCD2LONG *)


  PROCEDURE MULTLONG;  (* P010009 *)
  
    VAR
         UNUSEDXX : INTEGER;
         UNUSEDYY : INTEGER;
         DIGITX   : INTEGER;
         BCDNUM   : TBCD;
         
    BEGIN
      LONG2BCD( LONGNUM, BCDNUM);
      FOR DIGITX := 12 DOWNTO 1 DO
        BCDNUM[ DIGITX] := BCDNUM[ DIGITX] * INTNUM;
      FOR DIGITX := 12 DOWNTO 1 DO
        IF BCDNUM[ DIGITX] > 9 THEN
          BEGIN
            BCDNUM[ DIGITX - 1] := BCDNUM[ DIGITX - 1] +
                                   BCDNUM[ DIGITX] DIV 10;
            BCDNUM[ DIGITX] := BCDNUM[ DIGITX] MOD 10
          END;
      BCD2LONG( LONGNUM, BCDNUM)
    END;  (* MULTLONG *)


  PROCEDURE DIVLONG;  (* P01000A *)

    VAR
         NXTDIGIT : INTEGER;
         DIGITX   : INTEGER;
         BCDNUM   : TBCD;

    BEGIN
      LONG2BCD( LONGNUM, BCDNUM);
      FOR DIGITX := 1 TO 12 DO
        BEGIN
          NXTDIGIT := BCDNUM[ DIGITX] DIV INTNUM;
          BCDNUM[ DIGITX + 1] := BCDNUM[ DIGITX + 1] + 
                                 (10 * (BCDNUM[ DIGITX] - NXTDIGIT * INTNUM));
          BCDNUM[ DIGITX] := NXTDIGIT
        END;
      BCD2LONG( LONGNUM, BCDNUM)
    END;  (* DIVLONG *)


  FUNCTION TESTLONG;  (* P01000B *)
                    
    PROCEDURE LTEQGT( FIRSTX:  INTEGER;  (* P01002E *)
                      SECONDX: INTEGER);
    
      BEGIN
        IF FIRSTX = SECONDX THEN
          EXIT( LTEQGT)
        ELSE
          BEGIN
            IF FIRSTX > SECONDX THEN
              TESTLONG := 1
            ELSE
              TESTLONG := -1
          END;
        EXIT( TESTLONG)
      END; (* LTEQGT *)
      
  
    BEGIN  (* TESTLONG *)
      LTEQGT( FIRST.HIGH, SECOND.HIGH);
      LTEQGT( FIRST.MID,  SECOND.MID);
      LTEQGT( FIRST.LOW,  SECOND.LOW);
      TESTLONG := 0
    END;


  PROCEDURE PRNTLONG;  (* P01000C *)
                     
    VAR
         BCDNUM   : TBCD;
         NONSPCX  : INTEGER;
         LEADSPCX : INTEGER;
  
    BEGIN
      LONG2BCD( LONGNUM, BCDNUM);
      LEADSPCX := 1;
      WHILE (LEADSPCX < 12) AND (BCDNUM[ LEADSPCX] = 0) DO
        BEGIN
          LEADSPCX := LEADSPCX + 1;
          WRITE( ' ')
        END;
      FOR NONSPCX := LEADSPCX TO 12 DO
        WRITE(  BCDNUM[ NONSPCX] : 1)
    END;  (* PRNTLONG *)


  PROCEDURE GETKEY;  (* P01000D *)
  
    CONST
         SYSTERM = 2;
         
    VAR
         INBUF : PACKED ARRAY[ 0..1] OF CHAR;
  
  
    BEGIN
      MVCURSOR( 80, 0);  (* ADJUST RANDOM #, AND RETURN WHEN A CHAR IS AVAIL *)
      UNITREAD( SYSTERM, INBUF, 1, 0, 0);
      INCHAR := INBUF[ 0];
      IF EOLN THEN
        INCHAR := CHR( CRETURN)
    END;  (* GETKEY *)


  PROCEDURE GETLINE;  (* P01000E *)
  
    VAR
         IPOS : INTEGER;
         
    BEGIN
      IPOS := 0;
      REPEAT
        GETKEY;
        IF (INCHAR >= CHR( 32)) AND
           (INCHAR <= CHR( 90)) AND
           (IPOS < 40) THEN
          BEGIN
             IPOS:= IPOS + 1;
            GTSTRING[ IPOS] := INCHAR;
            WRITE( INCHAR)
          END
        ELSE
          BEGIN
            IF INCHAR = CHR( 8) THEN
              BEGIN
                IF IPOS > 0 THEN
                  BEGIN
                    WRITE( INCHAR);
                    WRITE( ' ');
                    WRITE( INCHAR);
                    IPOS := IPOS -1
                  END;
              END;
          END;
      UNTIL INCHAR = CHR( CRETURN);
      GTSTRING[ 0] := CHR( IPOS)
    END;
    
    
   FUNCTION GETCHARX;  (* P01000F *)
  
    BEGIN
      GOTOXY( 0, 18);
      WRITE( CHR( 11));
      IF DSPNAMES THEN
        BEGIN
          FOR LLBASE04 := 0 TO PARTYCNT - 1 DO
            BEGIN
              GOTOXY( 20 * (LLBASE04 MOD 2), 20 + (LLBASE04 DIV 2));
              WRITE( LLBASE04 + 1 :1);
              WRITE( ') ' );
              WRITE( CHARACTR[ LLBASE04].NAME);
            END;
        END;
      REPEAT
        GOTOXY( 0, 18);
        WRITE( CHR( 29));
        WRITE( SOLICIT);
        WRITE( ' ([RETURN] EXITS) >');
        GETKEY;
        LLBASE04 := ORD( INCHAR) - ORD( '0');
      UNTIL ((LLBASE04 > 0) AND (LLBASE04 <= PARTYCNT)) OR
            (INCHAR = CHR( 13));
      IF INCHAR = CHR( CRETURN) THEN
        LLBASE04 := 0;
      GETCHARX := LLBASE04 - 1
    END;
  
  
  PROCEDURE PAUSE1;   (* P010011 *)
  
    BEGIN
      FOR LLBASE04 := 0 TO TIMEDLAY DO
        BEGIN
        END;
    END;
    
    
  PROCEDURE PAUSE2;   (* P010012 *)
  
    BEGIN
      FOR LLBASE04 := 0 TO 3000 DO
        BEGIN
        END
    END;
    
    
  PROCEDURE CENTSTR;  (* P010010 *)
  
    BEGIN
      GOTOXY( 20 - (LENGTH( ASTRING) DIV 2), 23);
      WRITE( ASTRING);
      GOTOXY( 41, 0);
      PAUSE2
    END;
    
    
  PROCEDURE CLEARPIC;  (* P010013 *)
  
    BEGIN
      CLRPICT( 0, 0, 0, 100)    (* 100 === CLEAR PICTURE *)
    END;
    
    
  PROCEDURE GRAPHICS;  (* P010014 *)
  
    BEGIN
      MVCURSOR( 40, 0)    (* GRAPHICS MODE *)
    END;
    
    
  PROCEDURE TEXTMODE;  (* P010015 *)
  
    BEGIN
      MVCURSOR( 50, 0)    (* TEXT MODE *)
    END;
    
    
  PROCEDURE PRINTCHR;  (* P010016 *)
  
    BEGIN
      PRGRCHR( CHARSET[ ORD( ACHAR) - 32])
    END;
    
    
  PROCEDURE PRINTSTR;  (* P010017 *)
  
    VAR
         IPOS : INTEGER;
  
    BEGIN
      FOR IPOS := 1 TO LENGTH( ASTRING) DO
        BEGIN
          PRGRCHR( CHARSET[ ORD( ASTRING[ IPOS]) - 32])
        END;
    END;
    
    
  PROCEDURE PRINTNUM;  (* P010018 *)
  
    VAR
         DIGITS : STRING[ 5];
         DIGITX : INTEGER;
         
    BEGIN
      IF ANUM < 0 THEN
        ANUM := 0;
      IF FIELDSZ > 5 THEN
        FIELDSZ := 5;
      IF FIELDSZ < 1 THEN
        FIELDSZ := 1;
      FOR DIGITX := 5 DOWNTO 1 DO
        BEGIN
           DIGITS[  DIGITX]  :=  CHR( 48 +  (ANUM MOD 10));
           ANUM := ANUM DIV 10
        END;
      DIGITX := 1;
      WHILE  (DIGITX < 5) AND (DIGITS[ DIGITX] = CHR( 48)) DO
        BEGIN
          DIGITS[ DIGITX] := CHR( 32);
           DIGITX:= DIGITX + 1
        END;
      FOR DIGITX := (6 - FIELDSZ) TO 5 DO
        BEGIN
          PRINTCHR( DIGITS[ DIGITX])
        END;
    END;
    
    
  PROCEDURE GETSTR;
  
    VAR
         UNUSEDXX : INTEGER;
         UNUSEDYY : INTEGER;
         IPOS     : INTEGER;
         
    BEGIN
      IPOS := 0;
      REPEAT
        MVCURSOR( WINXPOS + IPOS, WINYPOS);
        PRINTCHR( CHR( 64));
        GETKEY;
        IF INCHAR = CHR( 27) THEN
          BEGIN
            CLRRECT( WINXPOS, WINYPOS, IPOS + 1, 1);
            IPOS := 0
          END
        ELSE
          BEGIN
            IF (INCHAR = CHR( 8)) AND (IPOS > 0) THEN
              BEGIN
                CLRRECT( WINXPOS + IPOS, WINYPOS, 1, 1);
                IPOS := IPOS - 1
              END
            ELSE
              BEGIN
                IF (INCHAR <> CHR( CRETURN)) AND (ORD( INCHAR) >= 32) THEN
                  BEGIN
                    MVCURSOR( WINXPOS + IPOS, WINYPOS);
                    PRINTCHR( INCHAR);
                    IPOS := IPOS + 1;
                    ASTRING[ IPOS] := INCHAR
                  END
              END
          END
      UNTIL INCHAR = CHR( CRETURN);
      ASTRING[ 0] := CHR( IPOS)
    END;


(* ========================================================================== *)
(* DISK: Wiz1D.DSK | FILE: CLRRECT.TEXT                                *)
(* ========================================================================== *)

 .PROC CLRRECT,4 ; 4 PARAMETERS   ;     P01001E,4 ;
;
 .REF L0998, L0999
;
;          ; CALL:  CLRRECT( X, Y, WIDTH, HEIGHT);
;
;          ; WIDTH = # OF COLUMNS (7 BITS PER COLUMN) TO CLEAR
;          ; HIEGHT = # OF LINES (8 BITS PER LINE) TO CLEAR
;
;          ; X, Y ARE UPPER LEFT CORNER OF RECTANGLE TO CLEAR
;          ; 0,0 IS UPPER LEFT ORIGIN
;
 CLC
 CLD
 PLA       ; PULL RETURN
 STA 00
 PLA
 STA 01
;
 PLA       ; 09 := PARM 4    HEIGHT (LINES)
 STA 09
 PLA       ; 07 := PARM 3    WIDTH  (COLS)
 PLA
 STA 07
 PLA
 PLA       ; 08 := PARM 2    Y
 STA 08
 PLA
 PLA       ; 06 := PARM 1    X
 STA 06
 PLA
;
 LDA 01    ; PUSH RETURN
 PHA
 LDA 00
 PHA
;
L5854
 JSR L585E ; CLEAR 1 "LINE" (8 PIXELS) ON THE HI RES SCREEN
 INC 08    ; INC TO NEXT LINE
 DEC 09    ; DEC LINES LEFT
 BNE L5854 ; DO ANOTHER LINE
 RTS
;
L585E
;            ; CLEAR 1 "LINE" (8 PIXELS) ON THE HI RES SCREEN.
;
 LDA 08      ; "LINE" NUMBER (8 PIXELS PER HI RES "LINE")
 ASL A       ; ADJUST.  2 BYTES PER POINTER IN L0998 TABLE
 TAY
 LDA L0998,Y ; 04.05 := PTR TO TOP OF "LINE" ON HI RES SCREEN
 STA 04      ;          THESE ARE LEFT EDGE OF SCREEN.
 LDA L0999,Y ;          EACH POINTER IN THIS TABLE OCCUPIES 2 BYTES.
 STA 05
;
 LDA #00
 JSR L5887   ; CLEAR HI RES ROW 1 FOR THIS "LINE" 
 JSR L5887   ; CLEAR HI RES ROW 2 FOR THIS "LINE"
 JSR L5887   ;
 JSR L5887   ;
 JSR L5887   ;
 JSR L5887   ;
 JSR L5887   ;
 JSR L5887   ; CLEAR HI RES ROW 8 FOR THIS "LINE"
 RTS
;
L5887
;            ; CLEAR 1 ROW OF PIXELS
;
 LDY 06      ; HORIZONTAL (X) COORDINATE
 LDX 07      ; NUMBER OF COLUMNS TO CLEAR
L588B
 STA @4,Y    ; CLEAR 7 PIXELS ON HI RES
 INY
 DEX
 BNE L588B   ; DO ANOTHER HI RES COLUMN
             ; DONE WITH THAT ROW
 INC 05      ; ADVANCE POINTER TO NEXT HI RES LINE
 INC 05
 INC 05
 INC 05
 RTS
 .END

(* ========================================================================== *)
(* DISK: Wiz1D.DSK | FILE: MVCURSOR.TEXT                               *)
(* ========================================================================== *)

 .PROC MVCURSOR,2 ; 2 PARAMETERS ;    P01001F,2
;
;          ; CALL:  MVCURSOR (X, Y);
;          ;
;          ; IN THIS ROUTINE:
;          ;
;          ;        X STORED AT $4F9  (SLOT #1 RAM SPACE)
;          ;        Y STORED AT $579  (SLOT #1 RAM SPACE)
;          ;
;          ;            PRGRCHR USES $4F9 AND $579
;          ;
;          ; MVCURSOR( 40, Y)    TURN ON GRAPHICS MODE
;          ; MVCUROSR( 50, Y)    TURN ON TEXT MODE
;          ; MVCURSOR( 60, Y)    JUMP TO $2002  (COPY PROTECTION)
;          ; MVCURSOR( 70, Y)    CRASH AND BURN (COPY PROTECTION)
;          ; MVCURSOR( 80, Y)    ADJUST RANDOM # (UNTIL KEY IS AVAILABLE)
;          ;                                  $47A, $47B, $47C, $47D (???)
;          ;                       RNG USES:  $47A, $4FA, $57A, $5FB (!!!)
;    
 PLA       ; PULL RETURN
 STA 00
 PLA
 STA 01
;
 PLA       ; PARAM 2    08 := Y COORDINATE
 STA 08
 PLA
 PLA       ; PARAM 1    06 := X COORDINATE
 STA 06
 PLA
;
 LDA 01    ; PUSH RETURN
 PHA
 LDA 00
 PHA
;
 LDA 06
 CMP #028  ; X = 40?
 BEQ L58EF ;   YES, L58EF
;
 CMP #032  ; X = 50?
 BEQ L58FC ;   YES, L58FC
;
 CMP #03C  ; X = 60?
 BEQ L5909 ;   YES, L5909
;
 CMP #046  ; X = 70?
 BEQ L590C ;   YES, L590C
;
 CMP #050  ; X = 80?
 BEQ L5920 ;   YES, L5920
;
;          ; X NOT A "SPECIAL" VALUE
;
 STA 004F9 ; SAVE "X" COORDINATE (AT SLOT #1 RAM SPACE)
 LDA 08
 STA 00579 ; SAVE "Y" COORDINATE (AT SLOT #1 RAM SPACE)
 RTS
;
L58EF
;
;          ; TURN ON GRAPHICS MODE
; 
 STA 0C050 ;   GRAPHICS
 STA 0C054 ;   PRIMARY PAGE
 STA 0C057 ;   HI RES
 STA 0C052 ;   ALL GRAPHICS
 RTS
;
L58FC
;
;          ; TURN ON TEXT MODE
;
 STA 0C051 ;   TEXT
 STA 0C054 ;   PRIMARY PAGE
 STA 0C056 ;   LO RES
 STA 0C052 ;   ALL TEXT
 RTS
;
L5909
;
;          ; EXECUTE COPY PROTECTION CODE
;          ; CODE AT $2002 WAS LOADED FROM SCENARIO.DATA ON SIDE 2 OF DISK
;          ;
 JMP 02002 ;
;
L590C
;
;          ; CRASH AND BURN  (PART OF COPY PROTECTION CODE)
;
 LDA #0BF  ; START AT $BF00..$BFFF
 STA 03
 LDA #00
 STA 02
;
L5914
 LDY #00
L5916
 STA @2,Y  ; STORE 0
 DEY
 BNE L5916 ; DO 256 BYTES
;
 DEC 03    ; CONTINUE DOWNWARD THROUGH MEMORY
 JMP L5914 ; EVENTUALLY THE SYSTEM WILL EXECUTE A 0 INSTRUCTION
           ; WHICH IS A BRK INSTRUCTION.  SINCE THE BRK VECTORS
           ; HAVE ALREADY BEEN CHANGED, THE MONITOR WILL REBOOT.
           ;
L5920
;
;          ; ADJUST RANDOM # UNTIL KEY IS AVAILABLE FROM INPUT BUFFER
;          ;   OR A KEY IS PRESSED.
;
 LDA 0C083 ; SELECT RAM CARD RAM READ, BANK 2
 JSR 0BF0A ; $BF0A IS CONCK IN SYSCOM (PASCAL OS)
 LDA 0C083
 LDA 0BF18 ; $BF18 IS RPTR IN SYSCOM (PASCAL OS)
 CMP 0BF19 ; $BF19 IS WPTR IN SYSCOM (PASCAL OS)
 BNE L5942 ; CIRCULAR INPUT BUFFER.  WHEN EQUAL, THEN NO CHARACTERS AVAILABLE.
;
;            ;   NO CHARACTER WAS IN THE INPUT BUFFER
L5931
 LDX #00
L5933
 INC 0047A,X ; INCREMENT RANDOM #         (BUG !!!!!!)
 BNE L593D   ;   $47A, $47B, $47C, $47D   (??????????)
 INX         ;   RAM FOR SLOTS #2, #3, #4, #5
 CPX #04     ;
 BNE L5933   ; RNG CODE USES $47A, $4FA, $57A, $5FB (ALL SLOT #2)
L593D
 LDA 0C000   ; KEYBOARD DATA
 BPL L5931   ; KEY PRESSED?  NO, L5931  (CONTINUE INCREMENTING RANDOM #)
;
L5942
;            ;   YES, A KEY WAS PRESSED (OR IS AVAILABLE FROM INPUT BUFFER)
 LDA 0C08B   ; RAM CARD RAM READ, BANK 1
 RTS
 .END

(* ========================================================================== *)
(* DISK: Wiz1D.DSK | FILE: PRGRCHR.TEXT                                *)
(* ========================================================================== *)

 .PROC PRGRCHR,1 ; 1 PARAMETER    ; P010020,1
;
;        CALL:  PRGRCHR( ACHAR);
;
;               ACHAR IS A PACKED ARRAY[ 0..7] OF 0..255;  (SEE TCHRIMAG)
;
;        PURPOSE:  PRINT A CHARACTER TO THE HI RES SCREEN (7 X 8 PIXELS)
;
;        USES:  $579 IS LINE POSITION ON SCREEN
;               $4F9 IS HORIZONTAL POSTION ON SCREEN
;
 .DEF L0998, L0999
;
 PLA          ; PULL RETURN
 STA 00
 PLA
 STA 01
;
 PLA          ; 02 := CHARACTER TO DISPLAY  (PACKED ARRY[ 0..7] OF 0..255)
 STA 02
 PLA
 STA 03
;
 LDA 01       ; PUSH RETURN
 PHA
 LDA 00
 PHA
;
 CLD
 CLC
 LDA 00579    ; LINE POSITION
 ASL A        ; ADJUST SINCE L5998 AND L5999 HAVE 2 BYTES PER POINTER
 TAY
 LDA L5998,Y  ; LEFT EDGE OF SCREEN (TOP PIXEL OF CHARACTER)
 ADC 004F9    ; ADD HORIZONTAL POSITION ON SCREEN
 STA 04       ; SET 04.05 TO HI RES LOCATION FOR CHARACTER
 LDA L5999,Y
 STA 05
 LDX #08      ; EACH CHARACTER IS 8 PIXELS HIGH
 LDY #00
;
L597E
;
;             ; PLACE A ROW OF PIXELS ON THE SCREEN FOR THE CHARACTER
;
 LDA @2,Y     ; GET 7 PIXELS OF THE CHARACTER
 STA @4,Y     ; PUT 7 PIXELS ON THE SCREEN
 INC 05       ; ADVANCE 1 ROW OF PIXELS ON THE SCREEN
 INC 05
 INC 05
 INC 05
 CLC
 INC 02       ; INCREMENT TO NEXT ROW OF CHARACTER PIXELS
 BNE L5991
 INC 03
L5991
 DEX
 BNE L597E    ; DO ANOTHER ROW UNTIL 8 ARE PLACED ON SCREEN.
              ; 8 ROWS FOR 1 CHARACTER HAVE BEEN PLACED ON THE SCREEN.
 INC 004F9    ; ADVANCE HORIZONTAL POSITION
 RTS
;
;
;             ; TABLE OF 24 POINTERS TO LEFT EDGE OF HI RES SCREEN
;             ; EACH PTR REPRESENTS ONE "CHARACTER" ROW OF 8 PIXELS.
;
L0998
L5998
 .BYTE 0
L0999
L5999
 .BYTE 020, 080, 020, 000, 021, 080, 021, 000, 022, 080, 022, 000, 023, 080
 .BYTE 023, 028, 020, 0A8, 020, 028, 021, 0A8, 021, 028, 022, 0A8, 022, 028
 .BYTE 023, 0A8, 023, 050, 020, 0D0, 020, 050, 021, 0D0, 021, 050, 022, 0D0
 .BYTE 022, 050, 023, 0D0, 023
 .END

(* ========================================================================== *)
(* DISK: Wiz1D.DSK | FILE: DRAWLINE.TEXT                               *)
(* ========================================================================== *)

 .PROC DRAWLINE,5 ;  P01001B,5 ; 5 PARAMETERS
 ;
 .DEF L5AE4, L5B33
 ;   DEFINE POINTERS TO HI RES SCREEN LEFT EDGE STARTING WITH LINE 5.
 ;
 ; THIS ROUTINE USES $679, $6F9, $779, $07F9 SET PREVIOUSLY BY
 ; CLRPICT PROCEDURE (WITH THE LAST PARAMETER NOT SET TO 100 OR 101).
 ;
 ; THOSE VALUES DETERMINE THE VALID RECTANGLE DRAWING REGION.
 ;
 CLC
 CLD
 PLA     ; POP RETURN
 STA 00
 PLA
 STA 01
 PLA
 STA 0C  ; 0C := PARM 5  LINE LENGTH (MAX NUMBER OF PIXELS TO DRAW)
 PLA
 PLA
 STA 0A  ; 0A := PARM 4  DELTA VERTICAL ( -1, 0, +1)
 PLA
 PLA
 STA 08  ; 08 := PARM 3  DELTA HORIZONTAL ( -1, 0, +1)
 PLA
 PLA
 STA 06  ; 06 := PARM 2  Y COORDINATE
 PLA
 PLA
 STA 04  ; 04 := PARM 1  X COORDINATE  (0,0) IS UPPER LEFT IN "PICTURE"
 PLA
;
 LDA 01  ; PUSH RETURN
 PHA
 LDA 00
 PHA
;
L59FA
 LDA 04       ; SEE IF X COORDINATE IS OUTSIDE DRAWING BOUNDARY
 CMP 00679
 BMI L5A2C    ;   YES, L5A2C
 CMP 00779
 BEQ L5A08
 BPL L5A2C    ;   YES, L5A2C
L5A08
 TAX
 LDA 06       ; SEE IF Y COORDINATE IS OUTSIDE DRAWING BOUNDARY
 CMP 006F9
 BMI L5A2C    ;   YES, L5A2C
 CMP 007F9
 BEQ L5A17
 BPL L5A2C    ;   YES, L5A2C
;
L5A17
;
;             ; PREPARE TO DRAW A PIXEL
;
 TAY
 LDA L5AE4,Y  ; SET UP POINTER TO HI RES SCREEN LOCATION
 STA 02       ;   L5AE4 TABLE STARTS WITH LINE 5 OF HI RES (ZERO BASED)
 LDA L5B33,Y
 STA 03
 LDY L5A40,X  ; GET BYTE OFFSET FROM LEFT EDGE OF SCREEN MEMORY MAP
 LDA L5A92,X  ; LOAD 1 BIT INTO A  (1 MEMORY LOCATION HOLDS 7 SCREEN PIXELS)
 ORA @2,Y     ; SET 1 BIT ON SCREEN
 STA @2,Y     ; SET 1 BIT ON SCREEN
L5A2C
 CLC          ; ADVANCE TO NEXT HORIZONTAL POSITION (-1, 0, +1)
 LDA 04
 ADC 08
 STA 04
 CLC          ; ADVANCE TO NEXT VERTICAL POSITION (-1, 0, +1)
 LDA 06
 ADC 0A
 STA 06
 CLC          ; DEC LINE LENGTH COUNTER
 DEC 0C
 BNE L59FA    ; DO ANOTHER PIXEL ALONG THE LINE.
 RTS
;
L5A40
;
;  HORIZONTAL OFFSET TO DETERMINE HI RES MEMORY MAPPED SCREEN LOCATION.
;  THE FIRST 4 COLUMNS OF HI RES ARE NOT PART OF THE "PICTURE" AREA.
;
;  THIS TABLE IS INDEXED BY THE HORIZONTAL PIXEL POSTION.
;
 .BYTE 000, 000, 000
 .BYTE 001, 001, 001, 001, 001, 001, 001
 .BYTE 002, 002, 002, 002, 002, 002, 002
 .BYTE 003, 003, 003, 003, 003, 003, 003
 .BYTE 004, 004, 004, 004, 004, 004, 004
 .BYTE 005, 005, 005, 005, 005, 005, 005
 .BYTE 006, 006, 006, 006, 006, 006, 006
 .BYTE 007, 007, 007, 007, 007, 007, 007
 .BYTE 008, 008, 008, 008, 008, 008, 008
 .BYTE 009, 009, 009, 009, 009, 009, 009
 .BYTE 00A, 00A, 00A, 00A, 00A, 00A, 00A
 .BYTE 00B, 00B, 00B, 00B, 00B, 00B, 00B
 .BYTE 00C, 00C
;
L5A92
;
;  PIXEL POSITION IN MEMORY MAPPED SCREEN LOCATION
;  THERE ARE 7 PIXELS PER BYTE (HI BIT NOT USED AS PIXEL BIT).
;  LOW ORDER BIT IS LEFTMOST ONE DISPLAYED ON SCREEN FOR THAT BYTE.
;
;  THE FIRST 4 COLUMNS ON HI RES ARE NOT PART OF THE "PICTURE" AREA.
;
 .BYTE 010, 020, 040
 .BYTE 001, 002, 004, 008, 010, 020, 040
 .BYTE 001, 002, 004, 008, 010, 020, 040
 .BYTE 001, 002, 004, 008, 010, 020, 040
 .BYTE 001, 002, 004, 008, 010, 020, 040
 .BYTE 001, 002, 004, 008, 010, 020, 040
 .BYTE 001, 002, 004, 008, 010, 020, 040
 .BYTE 001, 002, 004, 008, 010, 020, 040
 .BYTE 001, 002, 004, 008, 010, 020, 040
 .BYTE 001, 002, 004, 008, 010, 020, 040
 .BYTE 001, 002, 004, 008, 010, 020, 040
 .BYTE 001, 002, 004, 008, 010, 020, 040
 .BYTE 001, 002
;
L5AE4
;
; HI RES PAGE 1 LEFT EDGE SCREEN MEMORY PTR (LOW PART).
; THE TABLE STARTS WITH LINE 5 OF HI RES SCREEN.
; THIS IS THE "PICTURE" PART OF WIZARDRY DISPLAY WHERE THE MAZE
; IS DRAWN.  THE AREA IS 82 PIXELS WIDE BY 79 PIXELS HIGH.
;
 .BYTE 000, 000, 000
 .BYTE 080, 080, 080, 080, 080, 080, 080, 080
 .BYTE 000, 000, 000, 000, 000, 000, 000, 000
 .BYTE 080, 080, 080, 080, 080, 080, 080, 080
 .BYTE 000, 000, 000, 000, 000, 000, 000, 000
 .BYTE 080, 080, 080, 080, 080, 080, 080, 080
 .BYTE 000, 000, 000, 000, 000, 000, 000, 000
 .BYTE 080, 080, 080, 080, 080, 080, 080, 080
 .BYTE 028, 028, 028, 028, 028, 028, 028, 028
 .BYTE 0A8, 0A8, 0A8, 0A8, 0A8, 0A8, 0A8, 0A8
 .BYTE 028, 028, 028, 028
;
L5B33
;
; HI RES PAGE 1 LEFT EDGE SCREEN MEMORY PTR (HIGH PART)
;
 .BYTE 034, 038, 03C
 .BYTE 020, 024, 028, 02C, 030, 034, 038, 03C
 .BYTE 021, 025, 029, 02D, 031, 035, 039, 03D
 .BYTE 021, 025, 029, 02D, 031, 035, 039, 03D
 .BYTE 022, 026, 02A, 02E, 032, 036, 03A, 03E
 .BYTE 022, 026, 02A, 02E, 032, 036, 03A, 03E
 .BYTE 023, 027, 02B, 02F, 033, 037, 03B, 03F
 .BYTE 023, 027, 02B, 02F, 033, 037, 03B, 03F
 .BYTE 020, 024, 028, 02C, 030, 034, 038, 03C
 .BYTE 020, 024, 028, 02C, 030, 034, 038, 03C
 .BYTE 021, 025, 029, 02D
 .END

(* ========================================================================== *)
(* DISK: Wiz1D.DSK | FILE: CLRPICT.TEXT                                *)
(* ========================================================================== *)

 .PROC CLRPICT,4 ;   P01001A,4 ; 4 PARAMETERS
;
 .REF L5AE4, L5B33
;  REFERENCE HI RES SCREEN MEMORY POINTERS (LEFT EDGE) START WITH LINE 5.
;
;
;  CLEAR "PICTURE" AREA OF SCREEN (82 X 79 PIXELS)
;
;      -OR-
;
;  SET VALID RECTANGLE COORDINATES
;
;
 PLA       ; POP RETURN
 STA 00
 PLA
 STA 01
;
 PLA
 STA 06    ; 06 := PARAM 4
 PLA
 LDA 06
 CMP #064  ; PARAMETER 4 = 100?
 BEQ L5BF5 ;   YES, L5BF5    (CLEAR PICTURE AREA)
 CMP #065  ; PARAMETER 4 = 101?
 BEQ L5BC3 ;   YES, L5BC3    (FOR WIZARDRY I IT IS NEVER 101)
;
;            $7F9, $779, $6F9, $679 ARE SLOT #1 RAM SCRATCHPAD!?
;
;
;            SET UP VALID RECTANGLE DRAWING REGION (BOUNDARIES)
;
;
 STA 007F9 ; $7F9 = PARAM 4  Y UPPER BOUNDARY (ALWAYS 79)
 PLA
 STA 00779 ; $779 = PARAM 3  X UPPER BOUNDARY
 PLA
 PLA
 STA 006F9 ; $6F9 = PARAM 2  Y LOWER BOUNDARY (ALWAYS 0)
 PLA
 PLA
 STA 00679 ; $679 = PARAM 1  X LOWER BOUNDARY
 PLA
;
 LDA 01    ; PUSH RETURN
 PHA
 LDA 00
 PHA
 RTS
;
;
;

L5BC3 ;      PARAM 4 SET TO 101  (NEVER EXECUTED)
 PLA
 STA 06
 PLA
 STA 07
 PLA
 PLA
 PLA
 PLA
 LDA 01
 PHA
 LDA 00
 PHA
 CLC
 CLD
 LDA #04E
 STA 04
L5BD9
 JSR L5C0E
 DEC 04
 CMP #040
 BNE L5BD9
L5BE2
 JSR L5C34
 DEC 04
 CMP #0D
 BNE L5BE2
L5BEB
 JSR L5C0E
 DEC 04
 BNE L5BEB
 JMP L5C0E
;
;
; CLEAR PICTURE DISPLAY AREA
;
; 79 LINES X 82 COLUMNS OF PIXELS ON THE HI RES SCREEN.
;
;   START WITH LINE 5 (ZERO BASED) AND END WITH LINE 83 (ZERO BASED).
;   START WITH COLUMN 4 (ZERO BASED) AND END WITH COLUMN 85 (ZERO BASED).
;
L5BF5     ;  PARAM 4 = 100.
 PLA      ;  THROW AWAY ALL PARAMETERS.
 PLA
 PLA
 PLA
 PLA
 PLA
 LDA 01   ; PUSH RETURN ADDRESS
 PHA
 LDA 00
 PHA
;
 CLC
 CLD
 LDA #04E ; EXECUTE L5C0E (CLEAR LINE) 79 TIMES
 STA 04
L5C07
 JSR L5C0E
 DEC 04
 BNE L5C07
;
;              CLEAR 82 HORIZONTAL PIXELS (MAINTAIN FIRST 4 PIXELS ON LINE)
;
L5C0E
 LDX 04      ; INDEX INTO HI-RES LINE PTRS.  LINES 5 TO 83. (DECIMAL, BASE 0)
 LDA L5AE4,X ; START AT BOTTOM OF SCREEN AND WORK UPWARDS
 STA 02
 LDA L5B33,X
 STA 03      ; $02.03 HAVE ADDRESS OF LEFT EDGE OF HI-RES SCREEN
;
 LDX #0B     ; CLEAR 11 FULL BYTES (7 X 11 = 77 SCREEN PIXELS)
 LDY #00
 LDA #0F     ; MAINTAIN FIRST 4 LEFTMOST PIXELS ON THIS LINE,
 AND @2,Y    ; BUT CLEAR THE OTHER 3 PIXELS IN THIS BYTE
 STA @2,Y
 INY
 LDA #00     ; CLEAR 7 DISPLAYABLE PIXELS FOR EACH BYTE OF HI RES MEMORY
;
L5C27
 STA @2,Y
 INY
 DEX
 BNE L5C27   ; CLEAR 11 FULL BYTES (7 X 11 = 77 SCREEN PIXELS)
;
 LDA #0FC    ; IN NEXT BYTE, CLEAR FIRST 2 LEFTMOST PIXELS BUT MAINTAIN
 AND @2,Y    ; OTHER 5 DISPLAYABLE PIXELS.
 STA @2,Y    ;    3 + 77 + 2 = 82 PIXELS
 RTS
;
;
;
L5C34 ;       PART OF L5BC3 CODE.  NEVER EXECUTED.
 LDX 04
 LDA L5AE4,X
 STA 02
 LDA L5B33,X
 STA 03
 LDX #0B
 LDY #00
 LDA #0F
 AND @2,Y
 STA @2,Y
 INY
L5C4B
 LDA @6,Y
 STA @2,Y
 INY
 DEX
 BNE L5C4B
 LDA #0FC
 AND @2,Y
 STA @2,Y
 CLC
 LDA 06
 ADC #0A
 STA 06
 LDA 07
 ADC #00
 STA 07
 RTS
 .END

(* ========================================================================== *)
(* DISK: Wiz1D.DSK | FILE: KEYAVAIL.TEXT                               *)
(* ========================================================================== *)

 .FUNC KEYAVAIL,0 ; NO PARAMETERS   P010010
;
;    SEE IF A KEY WAS PRESSED (BUT DO NOT RETRIEVE IT) AND IS
;    IN THE PASCAL INPUT BUFFER.
;
 PLA       ; PULL RETURN
 STA 00
 PLA
 STA 01
;
 PLA       ; PULL DUMMY SINCE THIS IS A FUNCTION
 PLA
 PLA
 PLA
;
 LDA #00
 PHA
;
 LDA 0C083  ; SELECT RAMCARD RAM READ BANK 2
 JSR 0BF0A  ; CONCK (CHECK KEYBOARD) IN PASCAL SYSCOM AREA
 LDA 0C083  ; SELECT RAMCARD RAM READ BANK 2
            ;
            ; SEE ATTACH.PDF FOR DESCRIPTION OF RPTR AND WPTR 
 LDA #00    ; INIT STATUS TO NO CHARACTER AVAILABLE
 LDX 0BF18  ; RPTR
 CPX 0BF19  ; WPTR
 BEQ L5CA8  ; 0 MEANS NO CHARACTER AVAILABLE FROM CIRCULAR BUFFER
 LDA #01    ; INDICATE A CHARACTER IS IN THE INPUT BUFFER
L5CA8
 PHA        ; RETURN STATUS
 LDA 0C08B  ; SELECT RAMCARD RAM READ BANK 1
;
 LDA 01     ; PUSH RETURN ADDRESS
 PHA
 LDA 00
 PHA
 RTS
 .END

(* ========================================================================== *)
(* DISK: Wiz1D.DSK | FILE: RANDOM.TEXT                                 *)
(* ========================================================================== *)

 .FUNC RANDOM,0 ;     P01001C,0 ; NO PARAMETERS
;
;
;           CALL:  RANDOM;
;
;           PURPOSE:  RETURN A RANDOM NUMBER FROM 0 TO 32,767.
;
;           NOTE:  USES $47A, $4FA, $57A, $5FB.  (SLOT #2 RAM)
;           NOTE2: MVCURSOR( 80, X), USED BY GETKEY(), CHANGES
;                  VALUES OF $47A, AND
;                            $47B, $47C, $47D (BUG?)
;
 PLA       ; PULL RETURN
 STA 00
 PLA
 STA 01
;
 PLA       ; PULL DUMMY SINCE THIS IS A FUNCTION
 PLA
 PLA
 PLA
;
 LDY #07   ; SHIFT SOME BITS 7 TIMES
L5CCC
 ASL 0047A
 PHP
 ROL 004FA
 ROL 0057A
 ROL 005FB
 BMI L5CE0
 PLP
 BPL L5CE6
 BMI L5CE3
L5CE0
 PLP
 BMI L5CE6
L5CE3
 INC 0047A
L5CE6
 DEY
 BNE L5CCC     ; PERFORMED 7 SHIFTS YET?  NO, L5CCC.
;              ; YES
 LDA 0047A     ; HIGH 16 BITS
 LSR A         ; CLEAR HIGH BIT (ENSURES ONLY POSITIVE NUMBER RETURNED)
 PHA           ; 
 LDA 0057A     ; USE $57A AS PART OF RANDOM NUMBER LOW 16 BITS
 PHA
;
 LDA 01        ; PUSH RETURN
 PHA
 LDA 00
 PHA
 RTS
 .END

(* ========================================================================== *)
(* DISK: Wiz1E.DSK | FILE: STARTUP.TEXT                                *)
(* ========================================================================== *)

(*$S+*) 
(*$L PRINTER: *)
(* SWITCH "$S+" PRECEDES $L SWITCH *)
(*$R-*)
(*$I-*)
(*$V-*)

(*
  WIZARDRY 1, SYSTEM.STARTUP
  REVERSE ENGINEERED BY:  THOMAS WILLIAM EWERS, 2014
*)


PROGRAM WIZBOOT;

  USES CHAINSTUFF;

  CONST
        DRIVE1 = 4;
        DRIVE2 = 5;
        WIZDIRBL = 2;
        SERIALBL = 5;
        BS = 8;
        ESC = 27;
        VT = 11;
        HOMECLR = 12;
        CR = 13;
     
     
  TYPE

       TBLOCKRG = 0..511;
  
       DIRENTRY = RECORD
           FIRSTBLK : INTEGER;
           LASTBLK  : INTEGER;
           FILEKIND : PACKED RECORD
               FT : (VOLHEAD, BADBLK, MACH6502, TEXT, DEBUG,
                     DATA, GRAFFILE, FOTOFILE, SUBDIR);
             END;
           FILENAME : STRING[ 7];
           VOLLB    : INTEGER;
           FILECNT  : INTEGER;
           LOADTIM  : INTEGER;
           BOOTDATE : INTEGER;
           RES1     : INTEGER;
           RES2     : INTEGER;
         END;
  
       TWIZLONG = RECORD
           LOW  : INTEGER;
           MID  : INTEGER;
           HIGH : INTEGER;
         END;
         
       TRACE = (NORACE, HUMAN, ELF, DWARF, GNOME, HOBBIT);
       
       TCLASS = (FIGHTER, MAGE, PRIEST, THIEF,
                 BISHOP, SAMURAI, LORD, NINJA);
         
       TALIGN = (UNALIGN, GOOD, NEUTRAL, EVIL);
         
       TSTATUS = (OK, AFRAID, ASLEEP, PLYZE, 
                  STONED, DEAD, ASHES, LOST);
       
       TATTRIB = (STRENGTH, IQ, PIETY, VITALITY, AGILITY, LUCK);
       
       TSPELL7G = ARRAY[ 1..7] OF INTEGER;
       
       THPREC = RECORD
           LEVEL   : INTEGER;
           HPFAC   : INTEGER;
           HPMINAD : INTEGER;
         END;
                
                
       TCHAR = RECORD
           NAME     : STRING[ 15];
           PASSWORD : STRING[ 15];
           INMAZE   : BOOLEAN;
           RACE     : TRACE;
           CLASS    : TCLASS;
           AGE      : INTEGER;
           STATUS   : TSTATUS;
           ALIGN    : TALIGN;
           ATTRIB   : PACKED ARRAY[ STRENGTH..LUCK] OF 0..18;
           LUCKSKIL : PACKED ARRAY[ 0..4] OF 0..31;
           GOLD     : TWIZLONG;
           POSS     : RECORD
               POSSCNT : INTEGER;
               POSSESS : ARRAY[ 1..8] OF RECORD
                   EQUIPED : BOOLEAN;
                   CURSED  : BOOLEAN;
                   IDENTIF : BOOLEAN;
                   EQINDEX : INTEGER;
                 END;
             END;
           EXP      : TWIZLONG;
           MAXLEVAC : INTEGER;
           CHARLEV  : INTEGER;
           HPLEFT   : INTEGER;
           HPMAX    : INTEGER;
           SPELLSKN : PACKED ARRAY[ 0..49] OF BOOLEAN;
           MAGESP   : TSPELL7G;
           PRIESTSP : TSPELL7G;
           HPCALCMD : INTEGER;
           ARMORCL  : INTEGER;
           HEALPTS  : INTEGER;
           CRITHITM : BOOLEAN;
           SWINGCNT : INTEGER;
           HPDAMRC  : THPREC;
           WEPVSTY2 : PACKED ARRAY[ 0..1, 0..13] OF BOOLEAN;
           WEPVSTY3 : PACKED ARRAY[ 0..1, 0..6] OF BOOLEAN;
           WEPVSTYP : PACKED ARRAY[ 0..13] OF BOOLEAN;
           LOSTXYL  : RECORD CASE INTEGER OF
               1:  (LOCATION : ARRAY[ 1..4] OF INTEGER);
               2:  (POISNAMT : ARRAY[ 1..4] OF INTEGER);
               3:  (AWARDS   : ARRAY[ 1..4] OF INTEGER);
             END;
         END;
                
                
  VAR 
       INCHAR : CHAR;
       BASE04 : INTEGER;
       SERIAL : STRING[ 7];
       
       
  PROCEDURE LZDECOMP( VAR A1 : INTEGER;
                          A2 : INTEGER); EXTERNAL;     (* P070002 *)
  
  PROCEDURE CHKSYNCH( VAR COUNT: INTEGER); EXTERNAL;   (* P070003 *)
   
   
(*$I WIZ1E:WIZUTILB *)
(*$I WIZ1E:WIZUTILC *)
(*$I WIZ1E:TITLELOA *)
(*$I WIZ1E:OPTIONS  *)


  PROCEDURE CHKCOPY;  (* P070004 *)
  
    VAR
        CPCALC   : INTEGER;
        TRIES    : INTEGER;
        SAVEI    : INTEGER;
        CPTEMP   : INTEGER;
        GOODCOPY : BOOLEAN;
        SYNCH    : ARRAY[ 0..3] OF INTEGER;
        IOCACHE  : PACKED ARRAY[ TBLOCKRG] OF CHAR;
  
    BEGIN
      UNITREAD( DRIVE1, IOCACHE, SIZEOF( IOCACHE), SERIALBL, 0);
      MOVELEFT( IOCACHE, SERIAL, 7);
      
      CPTEMP := 31;
      FOR SAVEI := 10 TO 13 DO
        BEGIN
          MOVELEFT( IOCACHE[ CPTEMP], SYNCH[ SAVEI - 10], 2);
          CPTEMP := CPTEMP + 2 * ((SYNCH[ SAVEI - 10]) MOD 13) + 5;
        END;
        
      FOR TRIES := 1 TO 5 DO
        BEGIN
          GOODCOPY := TRUE;
          FOR SAVEI := 10 TO 13 DO
            BEGIN
              UNITREAD( DRIVE1, IOCACHE, SIZEOF( IOCACHE), 8 * SAVEI, 0);
              CHKSYNCH( CPTEMP);
              IF SAVEI = 10 THEN
                CPCALC := CPTEMP - SYNCH[ 10 - 10];
              CPTEMP := CPTEMP - CPCALC;
              GOODCOPY := GOODCOPY AND (ABS((CPTEMP - SYNCH[ SAVEI - 10]))
                                        < 35)
            END;
          IF GOODCOPY THEN
            EXIT( CHKCOPY)
        END;
      HALT
    END;
    
    
BEGIN  (* SYSTEM.STARTUP *)
  
  CHKCOPY;
  TITLELOA;
  REPEAT
    OPTIONS;
    CASE INCHAR OF
    
      'S':  BEGIN
              CHKCOPY;
              EXIT( WIZBOOT)
            END;
               
      'U':  UTILS;
            
      'T':  TITLELOA;
      
    END;
  UNTIL FALSE
END.  (* SYSTEM.STARTUP *)


(* ========================================================================== *)
(* DISK: Wiz1E.DSK | FILE: WIZUTILB.TEXT                               *)
(* ========================================================================== *)

SEGMENT PROCEDURE UTILS;  (* P070101 *)

  TYPE

        TSPEL012 = (GENERIC, PERSON, GROUP);
        
        TZSCN = (ZZERO, ZMAZE, ZENEMY, ZREWARD, ZOBJECT,
                 ZCHAR, ZSPCCHRS, ZEXP);
                   
        TSCNTOC = RECORD
            GAMENAME : STRING[ 40];
            RECPER2B : ARRAY[ ZZERO..ZEXP] OF INTEGER;
            RECPERDK : ARRAY[ ZZERO..ZEXP] OF INTEGER;
            UNUSEDXX : ARRAY[ ZZERO..ZEXP] OF INTEGER;
            BLOFF    : ARRAY[ ZZERO..ZEXP] OF INTEGER;
            RACE     : ARRAY[ NORACE..HOBBIT]         OF STRING[ 9];
            CLASS    : PACKED ARRAY[ FIGHTER..NINJA]  OF STRING[ 9];
            STATUS   : ARRAY[ OK..LOST]               OF STRING[ 8];
            ALIGN    : PACKED ARRAY[ UNALIGN..EVIL]   OF STRING[ 9];
            SPELLHSH : PACKED ARRAY[ 0..50] OF INTEGER;
            SPELLGRP : PACKED ARRAY[ 0..50] OF 0..7;
            SPELL012 : PACKED ARRAY[ 0..50] OF TSPEL012;
          END;

  VAR
  
       IOCACHE  : PACKED ARRAY[ 0..1023] OF CHAR;
       UNUSEDXX : INTEGER;
       CACHEBL  : INTEGER;
       SCNTOCBL : INTEGER;
       RANDNUM  : INTEGER;
       CACHEWRI : BOOLEAN;
       SCNTOC   : TSCNTOC;
    
    
    FUNCTION GETREC( DATATYPE : TZSCN;              (* P070102 *)
                     DATAINDX : INTEGER;
                     DATASIZE : INTEGER) : INTEGER;
                      
      VAR
           BUFFADDR : INTEGER;
           DSKBLOCK : INTEGER;
           
      BEGIN
        DSKBLOCK := SCNTOC.BLOFF[ DATATYPE] +
                    2 * (DATAINDX DIV SCNTOC.RECPER2B[ DATATYPE]);
        BUFFADDR := DATASIZE * (DATAINDX MOD SCNTOC.RECPER2B[ DATATYPE]);
        IF CACHEBL <> DSKBLOCK THEN
          BEGIN
            IF CACHEWRI THEN
              UNITWRITE( DRIVE1, IOCACHE, SIZEOF( IOCACHE),
                         CACHEBL + SCNTOCBL, 0);
            CACHEWRI := FALSE;
            CACHEBL := DSKBLOCK;
            UNITREAD( DRIVE1, IOCACHE, SIZEOF( IOCACHE),
                      CACHEBL + SCNTOCBL, 0)
          END;
        GETREC := BUFFADDR
      END;
        
        
  FUNCTION PUTREC( DATATYPE : TZSCN;             (* P070103 *)
                   DATAINDX : INTEGER;
                   DATASIZE : INTEGER) : INTEGER;
                   
    VAR
         BUFFADDR : INTEGER;
         DSKBLOCK : INTEGER;
                    
    BEGIN
        DSKBLOCK := SCNTOC.BLOFF[ DATATYPE] +
                    2 * (DATAINDX DIV SCNTOC.RECPER2B[ DATATYPE]);
        BUFFADDR := DATASIZE * (DATAINDX MOD SCNTOC.RECPER2B[ DATATYPE]);
        IF CACHEBL <> DSKBLOCK THEN
          BEGIN
            IF CACHEWRI THEN
              UNITWRITE( DRIVE1, IOCACHE, SIZEOF( IOCACHE),
                         CACHEBL + SCNTOCBL, 0);
            CACHEBL := DSKBLOCK;
            UNITREAD( DRIVE1, IOCACHE, SIZEOF( IOCACHE),
                      CACHEBL + SCNTOCBL, 0)
          END;
        CACHEWRI := TRUE;
        PUTREC := BUFFADDR
    END;
  
  
  PROCEDURE GETKEY;  (* P070104 *)
  
    BEGIN
      READ( INCHAR);
      IF EOLN THEN
        INCHAR := CHR( 13);
      RANDNUM := (RANDNUM + ORD( INCHAR)) MOD 1027
      (* NOTE:  RANDNUM IS GARBAGE WHEN THIS IS FIRST CALLED *)
    END;
    
    
  FUNCTION FINDFILE( DRIVE    : INTEGER;             (*  P070105 *)
                     FILENAME : STRING) : INTEGER;
                    
    VAR
         DIR      : ARRAY[ 0..12] OF DIRENTRY;
         FILEIFND : INTEGER;
         FILEI    : INTEGER;
         FILECNT  : INTEGER;

    BEGIN
      UNITREAD( DRIVE, IOCACHE, SIZEOF( IOCACHE), WIZDIRBL, 0);
      IF IORESULT <> 0 THEN
          FINDFILE := -ABS( IORESULT)    (* THIS IS A BUG *)
      ELSE
        BEGIN
          MOVELEFT( IOCACHE, DIR, SIZEOF( DIR)); 
          IF (DIR[ 0].FILECNT < 0) OR (DIR[ 0].FILECNT > 8) THEN
            BEGIN
              FINDFILE := -1;
              EXIT( FINDFILE)
            END;
          FILEIFND := 0;
          FILEI := 1;
          FILECNT := DIR[ 0].FILECNT;
          WHILE FILEI <= FILECNT DO
            BEGIN
              IF (DIR[ FILEI].FILEKIND.FT >= BADBLK) AND
                 (DIR[ FILEI].FILEKIND.FT <= FOTOFILE)    THEN
                BEGIN
                  IF DIR[ FILEI].FILENAME = FILENAME THEN
                    FILEIFND := FILEI
                END;
              FILEI := FILEI + 1;
            END;
          IF FILEIFND = 0 THEN
            FINDFILE := -9
          ELSE
            FINDFILE := DIR[ FILEIFND].FIRSTBLK
        END
      END;
    
    
  PROCEDURE GETCR;  (* P070106 *)
  
    BEGIN
      REPEAT
        GOTOXY( 41, 0);
        GETKEY
      UNTIL INCHAR = CHR( CR)
    END;
  
  
  PROCEDURE EXITUTIL;  (* P070107 *)
  
    VAR
        FILEINDX : INTEGER;
        
    BEGIN
      FILEINDX := FINDFILE( DRIVE1, 'SYSTEM.PASCAL');
      WHILE FILEINDX <= 0 DO
        BEGIN
          WRITE( CHR( HOMECLR));
          GOTOXY( 0, 10);
          WRITE( 'PLACE BOOT DISK IN DRIVE 1, PRESS RETURN');
          GETCR;
          FILEINDX := FINDFILE( DRIVE1, 'SYSTEM.PASCAL')
        END;
      EXIT( UTILS)
    END;


  PROCEDURE RDSCNTC2;  (* P070108 *)
  
    BEGIN
      CACHEWRI := FALSE;
      CACHEBL := 0;
      UNITREAD( DRIVE1, IOCACHE, SIZEOF( IOCACHE), SCNTOCBL);
      MOVELEFT( IOCACHE, SCNTOC, SIZEOF( SCNTOC))
    END;
  
  
  PROCEDURE RDSCNTOC( MSG : STRING);  (* P070109 *)
  
    VAR
        UNUSEDXX : INTEGER;
  
    BEGIN
      REPEAT
        WRITE( CHR( HOMECLR));
        GOTOXY( 20 - LENGTH( MSG) DIV 2, 8);
        WRITE( MSG);
        GOTOXY( 0, 10);
        WRITE( 'PLACE SCENARIO IN DRIVE 1, PRESS RETURN');
        UNITCLEAR( 1);
        GETCR;
        SCNTOCBL := FINDFILE( DRIVE1, 'SCENARIO.DATA')
      UNTIL (SCNTOCBL >= 0);
      RDSCNTC2
    END;
  
  
  PROCEDURE GETPASS( VAR PASSWD : STRING );  (* P07010A *)
  
    VAR
         UNUSEDXX : INTEGER;
         I        : INTEGER;
         PASSI    : INTEGER;
         
    BEGIN
      PASSI := 0;
      REPEAT
        GETKEY;
        IF INCHAR <> CHR( CR) THEN
          BEGIN
            WRITE( CHR( BS));
            FOR I := 0 TO RANDNUM MOD 2 DO
              WRITE( 'X')
          END;
        PASSI := PASSI + 1;
        PASSWD[ PASSI] := INCHAR
      UNTIL (INCHAR = CHR( CR)) OR (PASSI = 15);
      WRITELN;
      PASSWD[ 0] := CHR( PASSI - 1)
    END;
  
  
  PROCEDURE RDCHARAC( VAR CHARREC : TCHAR; CHARINDX : INTEGER);  (* P07010B *)
  
    BEGIN
      MOVELEFT( IOCACHE[ GETREC( ZCHAR, CHARINDX, SIZEOF( CHARREC))],
                CHARREC,
                SIZEOF( CHARREC)) 
    END;
  
  
  PROCEDURE WRCHARAC( VAR CHARREC : TCHAR; CHARINDX : INTEGER);  (* P07010C *)
  
    BEGIN
      MOVELEFT( CHARREC,
                IOCACHE[ PUTREC(  ZCHAR, CHARINDX, SIZEOF( CHARREC))], 
                SIZEOF( CHARREC)) 
    END;
    
    
  PROCEDURE WRICACHE;  (* P07010D *)
  
    BEGIN
      UNITWRITE( DRIVE1, IOCACHE, SIZEOF( IOCACHE), (CACHEBL + SCNTOCBL), 0);
      CACHEWRI := FALSE
    END;
    
    
  PROCEDURE PRESSRET;  (* P07010E *)
  
    BEGIN
      WRITELN;
      WRITE( 'PRESS [RET]' :25);
      GETCR
    END;
    
    
  PROCEDURE TITLESCR( TITLESTR : STRING);    (* P07010F *)
  
    VAR
        I : INTEGER;
        
    BEGIN
      WRITE( CHR( HOMECLR));
      WRITELN( TITLESTR : (20 + LENGTH( TITLESTR) DIV 2));
      FOR I := 1 TO 40 DO 
        WRITE( '-');
      WRITELN;
      WRITELN
    END;
    
    
  FUNCTION  RTNESC( TITLESTR : STRING;             (* P070110 *)
                    TITLE2ST : STRING) : BOOLEAN;
  
    BEGIN
      TITLESCR( TITLESTR);
      WRITELN( TITLE2ST : (20 + LENGTH( TITLE2ST) DIV 2));
      WRITELN;
      WRITE( ' PRESS [RET] TO BEGIN OR [ESC] TO EXIT');
      REPEAT
        GOTOXY( 41, 0);
        GETKEY;
        IF INCHAR = CHR( CR) THEN
          BEGIN
            RTNESC := FALSE;
            EXIT( RTNESC)
          END
        ELSE
          BEGIN
            IF INCHAR = CHR( ESC) THEN
              BEGIN
                RTNESC := TRUE;
                EXIT( RTNESC)
              END
          END
      UNTIL FALSE
    END;
    
    
  PROCEDURE CHGNAMES;  (* P070111 *)
  
    VAR
        PASSWD   : STRING[ 40];
        TONAME   : STRING[ 40];
        FROMNAME : STRING[ 40];
        X        : INTEGER;
        CHARINDX : INTEGER;
        BADSTUFF : BOOLEAN;
        PLAYREC  : TCHAR;
        
        
    PROCEDURE GETNAME( VAR CHARNAME : STRING;  (* P070112 *)
                           VERT4SOL : INTEGER;
                           PROMPT   : STRING);
                           
      BEGIN
        REPEAT
          REPEAT
            REPEAT
              GOTOXY( 0, VERT4SOL);
              WRITE( CHR( VT));
              WRITE( PROMPT);
              READLN( CHARNAME)
            UNTIL LENGTH( CHARNAME) <= 15;
            IF CHARNAME = '' THEN
              EXIT( CHGNAMES)
          UNTIL LENGTH( CHARNAME) > 0;
          
          BADSTUFF := FALSE;
          FOR X := 1 TO LENGTH( CHARNAME) DO
            BADSTUFF := BADSTUFF OR 
                        (CHARNAME[ X] < ' ') OR (CHARNAME[ X] > '_')
        UNTIL NOT BADSTUFF
      END;
    
  
    BEGIN (* CHGNAMES *)
      IF RTNESC( 'NAME CHANGE', '') THEN
        EXIT( CHGNAMES);
      RDSCNTOC( 'NAME CHANGE');
      
      REPEAT
        TITLESCR( 'NAME CHANGE');
        WRITELN( 'ENTER THE CURRENT NAME OF  THE CHAR');
        WRITELN( '& THEN THE NEW NAME. OR PRESS [RET]');
        WRITELN( 'TO EXIT.');
        GETNAME( FROMNAME, 10, 'FROM NAME >');
        GETNAME( TONAME, 12, ' TO  NAME >');
        WRITELN;
        WRITELN;
        IF TONAME <> '' THEN
          BEGIN
            BADSTUFF := FALSE;
            FOR CHARINDX := 0 TO SCNTOC.RECPERDK[ ZCHAR] - 1 DO
              BEGIN
                RDCHARAC( PLAYREC, CHARINDX);
                IF (PLAYREC.NAME = TONAME) AND (PLAYREC.STATUS <> LOST) THEN
                  BEGIN
                    WRITELN( 'NAME ALREADY IN USE');
                    BADSTUFF := TRUE
                  END
              END;
              
            IF NOT BADSTUFF THEN
              BEGIN
                X := -1;
                FOR CHARINDX := 0 TO SCNTOC.RECPERDK[ ZCHAR] - 1 DO
                  BEGIN
                    RDCHARAC( PLAYREC, CHARINDX);
                    IF PLAYREC.NAME = FROMNAME THEN
                      X := CHARINDX
                  END;
                  
                IF X = -1 THEN
                  WRITELN( 'CANT FIND CHAR')
                ELSE
                  BEGIN
                    RDCHARAC( PLAYREC, X);
                    WRITE( 'PASSWORD >');
                    GETPASS( PASSWD);
                    WRITELN;
                    IF PASSWD <> PLAYREC.PASSWORD THEN
                      WRITELN( 'PASSWORDS DO NOT MATCH')
                    ELSE
                      BEGIN
                        PLAYREC.NAME := TONAME;
                        WRCHARAC( PLAYREC, X);
                        WRICACHE;
                        WRITELN( 'NAME CHANGED!')
                      END
                  END
              END;
            PRESSRET
          END
      UNTIL FALSE
    END;  (* CHGNAMES *)
    

(* ========================================================================== *)
(* DISK: Wiz1E.DSK | FILE: WIZUTILC.TEXT                               *)
(* ========================================================================== *)

  PROCEDURE BACKUP;  (* P070113 *)
               
    VAR
         PLAY20BF : ARRAY[ 0..19] OF TCHAR;
         SERIALBU : STRING[ 7];
         SERIALXX : STRING[ 7];
         UNUSEDXX : INTEGER;
         CHARINDX : INTEGER;
  
  
    PROCEDURE FRBACKUP;  (* P070114 *)
    
      BEGIN
        WRITE( CHR( HOMECLR));
        WRITELN( 'PLACE BACKUP DISKETTE IN DRIVE 1,');
        PRESSRET;
        WRITE( CHR( HOMECLR));
        FOR CHARINDX := 0 TO 19 DO
          BEGIN
            GOTOXY( 20 * (CHARINDX MOD 2), CHARINDX DIV 2);
            UNITREAD( DRIVE1, PLAY20BF[ CHARINDX], SIZEOF( TCHAR),
                      CHARINDX, 0);
            IF PLAY20BF[ CHARINDX].STATUS <> LOST THEN
              WRITE( PLAY20BF[ CHARINDX].NAME)
          END;
          
        UNITREAD( DRIVE1, SERIALBU, 7, 20, 0);
        GOTOXY( 0, 20);
        WRITE( CHR( VT));
        WRITE( 'RECOVER THESE (Y/N) ? >');
        REPEAT
          GOTOXY (41, 0);
          GETKEY;
          IF INCHAR = 'N' THEN
            EXIT( BACKUP)
        UNTIL INCHAR = 'Y';
        
        RDSCNTOC( 'SCENARIO TO RECOVER TO');
        UNITREAD( DRIVE1, SERIALXX, 7, SERIALBL, 0);
        IF SERIALXX <> SERIALBU THEN
          BEGIN
            TITLESCR( 'CANT RECOVER ONTO DIFFERENT SCENARIO');
            WRITELN( 'SCENARIO MUST BE MADE OFF SAME MASTER');
            WRITELN( 'AS THE SCENARIO THE BACKUP WAS MADE');
            WRITELN( 'FROM.');
            PRESSRET;
            EXIT( BACKUP)
          END;
          
        TITLESCR( 'SAVING CHARS');
        FOR CHARINDX := 0 TO SCNTOC.RECPERDK[ ZCHAR] - 1 DO
          WRCHARAC( PLAY20BF[ CHARINDX], CHARINDX);
        WRICACHE;
        TITLESCR( 'BACKUP RECOVERED');
        PRESSRET
      END;
      
      
    PROCEDURE TOBACKUP;  (* P070115 *)
    
      BEGIN
        RDSCNTOC( 'MAKING BACKUP');
        UNITREAD( DRIVE1, SERIALXX, 7, SERIALBL, 0);
        TITLESCR( 'LOADING CHARS');
        FOR CHARINDX := 0 TO SCNTOC.RECPERDK[ ZCHAR] - 1 DO
          RDCHARAC( PLAY20BF[ CHARINDX], CHARINDX);
        WRITELN( 'LOADED! NOW PLACE A FORMATTED DISKETTE');
        WRITELN( 'IN DRIVE 1 AND PRESS [RETURN] TO SAVE.');
        WRITELN;
        GOTOXY( 41, 0);
        GETCR;
        
        IF FINDFILE( DRIVE1, 'WIZARDRY.CODE') >= 0 THEN
          BEGIN
            TITLESCR( 'CANT BACKUP ONTO A WIZARDRY DISK!');
            PRESSRET;
            EXIT( TOBACKUP)
          END;
          
        FOR CHARINDX := 0 TO SCNTOC.RECPERDK[ ZCHAR] -1 DO
          UNITWRITE( DRIVE1, PLAY20BF[ CHARINDX], SIZEOF( TCHAR),
                     CHARINDX, 0);
        UNITWRITE( DRIVE1, SERIALXX,  7, 20, 0);
        TITLESCR( 'BACKUP MADE');
        PRESSRET
      END;


    BEGIN  (* BACKUP *)
      IF RTNESC( 'CHAR BACKUP', '(INCOMPATIBLE WITH PREVIOUS VERSION)') THEN
        EXIT( BACKUP);
      TITLESCR( 'CHAR BACKUP');
      WRITELN;
      WRITE( 'T)O OR F)ROM BACKUP' :30);
      GOTOXY( 41, 0);
      GETKEY;
      IF INCHAR = 'T' THEN
        TOBACKUP
      ELSE IF INCHAR = 'F' THEN
        FRBACKUP
    END;
    
    
  PROCEDURE RECOVER;  (* P070116 *)
  
    VAR
         CHARREC  : TCHAR;
         CHARINDX : INTEGER;
         UNUSEDXX : ARRAY[ 0..1] OF INTEGER;
  
    BEGIN;
      IF RTNESC( 'CHAR RECOVERY', 'NO 10 YEAR PENALTY') THEN
        EXIT( RECOVER);
      RDSCNTOC( 'INSERT SCENARIO WITH "OUT" CHARS');
      WRITE( CHR( HOMECLR));
      WRITELN( 'RECOVERING');
      WRITELN;
      
      FOR CHARINDX := 0 TO SCNTOC.RECPERDK[ ZCHAR] - 1 DO
        BEGIN
          RDCHARAC( CHARREC, CHARINDX);
          IF CHARREC.INMAZE THEN
            BEGIN
              CHARREC.INMAZE := FALSE;
              WRCHARAC( CHARREC, CHARINDX);
              WRITE( CHARREC.NAME);
              WRITELN( ' SAVED');
            END
        END;
      WRICACHE;
      PRESSRET
    END;
    
    
  PROCEDURE TRANSFER;  (* P070117 *)
  
    VAR
         PLAYREC1 : TCHAR;
         PLAYREC2 : TCHAR;
         PLAYFRMI : INTEGER;
         PLAYINDX : INTEGER;
         MPD3     : CHAR;
         FRMRNDID : CHAR;
         FRMGAMNM : STRING;
         BL5BUFF  : PACKED ARRAY[ 0..511] OF CHAR;
         SERIALTO : STRING[ 7];
         SERIALFR : STRING[ 7];
         
         
    PROCEDURE REMOVCHR;  (* P070118 *)
    
      VAR
           PASSFROM : STRING;
           UNUSEDXX : INTEGER;
           PLAYERI  : INTEGER;
           
           
      PROCEDURE BADITEM;  (* P070119 *)
      
        BEGIN
          WRITELN;
          WRITELN( '** CHAR HAS NON-XFERRABLE ITEMS **');
          PRESSRET;
          EXIT( TRANSFER)
        END;
        
        
      BEGIN
        REPEAT
          WRITE( CHR( HOMECLR));
          WRITE( SCNTOC.GAMENAME :
                                (20 + (LENGTH( SCNTOC.GAMENAME) DIV 2)));
          FOR PLAYERI := 0 TO SCNTOC.RECPERDK[ ZCHAR] - 1 DO
            BEGIN
              GOTOXY( 20 * (PLAYERI MOD 2), 2 + (PLAYERI DIV 2));
              RDCHARAC( PLAYREC2, PLAYERI);
              IF PLAYREC2.STATUS = OK THEN
                BEGIN
                  WRITE( CHR( ORD('A') + PLAYERI));
                  WRITE( ' - ');
                  WRITE( PLAYREC2.NAME)
                END
            END;
          
          REPEAT
            REPEAT
              GOTOXY( 0, 18);
              WRITELN( 'NOTE - CHARS MUST BE LIVE & IN CASTLE');
              WRITELN;
              WRITELN( 'ENTER LETTER OF CHAR TO MOVE, OR');
              WRITE(   'OR PRESS [RETURN] TO EXIT');
              GOTOXY( 41, 0);
              GETKEY;
              IF INCHAR = CHR( CR) THEN
                EXIT( TRANSFER);
              PLAYINDX := ORD( INCHAR) - ORD('A')
            UNTIL (PLAYINDX >= 0) AND (PLAYINDX < SCNTOC.RECPERDK[ ZCHAR]);
            RDCHARAC( PLAYREC2, PLAYINDX)
          UNTIL PLAYREC2.STATUS = OK;
          
          WRITE( CHR( HOMECLR));
          WRITE( 'MOVING ');
          WRITELN( PLAYREC2.NAME);
          WRITELN;
          WRITE( 'PASSWORD >');
          GETPASS( PASSFROM)
        UNTIL PASSFROM = PLAYREC2.PASSWORD;
        
        FOR PLAYERI := 1 TO PLAYREC2.POSS.POSSCNT DO
          IF PLAYREC2.POSS.POSSESS[ PLAYERI].EQINDEX > 93 THEN
            BADITEM;
        
        PLAYREC1 := PLAYREC2;
        PLAYREC1.STATUS := LOST;
        WRCHARAC( PLAYREC1, PLAYINDX);
        WRICACHE
      END;  (* REMOVCHR *)
      
      
    PROCEDURE TRANBAD;  (* P07011A *)
    
      BEGIN
        REPEAT
          REPEAT
            IF (MPD3 = BL5BUFF[ 10]) AND
               (SERIALFR = SERIALTO)     THEN
              RDSCNTOC( 'CANT COPY TO BACKUP - PUT IN SOURCE')
            ELSE IF (PLAYINDX = -1) THEN
              RDSCNTOC( 'DUPLICATE NAME - PUT IN SOURCE')
            ELSE
              RDSCNTOC( 'ALL SLOTS USED - PUT IN SOURCE');
            UNITREAD( DRIVE1, BL5BUFF, SIZEOF( BL5BUFF), SERIALBL, 0)
          UNTIL (SCNTOC.GAMENAME = FRMGAMNM) AND (FRMRNDID = BL5BUFF[ 12]);
          RDCHARAC( PLAYREC1, PLAYFRMI)
        UNTIL PLAYREC1.NAME = PLAYREC2.NAME;
        WRCHARAC( PLAYREC2, PLAYFRMI);
        WRICACHE;
        TITLESCR( 'CHAR HAS BEEN PUT BACK.');
        PRESSRET
      END;
      
      
    PROCEDURE TRANGOOD;  (* P07011B *)
    
      BEGIN
        WRCHARAC( PLAYREC2, PLAYINDX);
        WRICACHE;
        TITLESCR( 'CHAR HAS BEEN MOVED');
        PRESSRET
      END;
         
         
    BEGIN  (* TRANSFER *)
      IF RTNESC( 'MOVE CHARS BETWEEN SCENARIOS', '') THEN
        EXIT( TRANSFER);
      RDSCNTOC( 'INSERT SCENARIO WITH CHAR(S) TO BE MOVED');
      UNITREAD( DRIVE1, BL5BUFF, SIZEOF( BL5BUFF), SERIALBL, 0);
      MPD3 := BL5BUFF[ 10];
      MOVELEFT( BL5BUFF, SERIALFR, 7);
      BL5BUFF[ 12] := CHR( (ORD( BL5BUFF[ 12]) + RANDNUM) MOD 256);
      UNITWRITE( DRIVE1, BL5BUFF, SIZEOF( BL5BUFF), SERIALBL, 0);
      FRMRNDID := BL5BUFF[ 12];
      REMOVCHR;
      PLAYFRMI := PLAYINDX;
      FRMGAMNM := SCNTOC.GAMENAME;
      RDSCNTOC( 'INSERT SCENARIO TO MOVE CHAR(S) TO');
      UNITREAD( DRIVE1, BL5BUFF, SIZEOF( BL5BUFF), SERIALBL, 0);
      MOVELEFT( BL5BUFF, SERIALTO, 7);
      PLAYINDX := SCNTOC.RECPERDK[ ZCHAR];
      
      IF (MPD3 <> BL5BUFF[ 10]) OR
         (SERIALFR <> SERIALTO)    THEN
         BEGIN
           FOR BASE04 := 0 TO SCNTOC.RECPERDK[ ZCHAR] - 1 DO
             BEGIN
               RDCHARAC( PLAYREC1, BASE04);
               IF (PLAYREC1.NAME = PLAYREC2.NAME) AND
                  (PLAYREC1.STATUS <> LOST) THEN
                 PLAYINDX := -1
               ELSE
                 IF PLAYINDX = SCNTOC.RECPERDK[ ZCHAR] THEN
                   IF PLAYREC1.STATUS = LOST THEN
                     PLAYINDX := BASE04
             END;
         END;
      
      IF (PLAYINDX = -1) OR
         (PLAYINDX = SCNTOC.RECPERDK[ ZCHAR]) THEN
         TRANBAD
      ELSE
         TRANGOOD
    END;  (* TRANSFER *)
    
    
  PROCEDURE MAKESCEN;  (* P07011C *)
      
    VAR
         UNUSED   : INTEGER;
         DUPIDX   : INTEGER;
         TEMPI    : INTEGER; (* MULTIPLE USES *)
         CHARREC0 : TCHAR;
         IOCACHE2 : PACKED ARRAY [ 0..3071] OF CHAR;
         SERBUFF  : PACKED ARRAY [ 0..511] OF CHAR;
      
      
    PROCEDURE EXITMAKE( ERRMSG : STRING);  (* P07011D *)
    
      BEGIN
        TITLESCR( 'ERROR MAKING SCENARIO');
        WRITELN( ERRMSG: (20 + LENGTH( ERRMSG) DIV 2) );
        PRESSRET;
        EXIT( MAKESCEN)
      END;  (* EXITMAKE *)
      
      
    PROCEDURE DSKERROR;  (* P07011E *)
    
      BEGIN
        EXITMAKE( 'DISK ERROR')
      END;
      
      
    PROCEDURE NOTSCEN; (* P07011F *)
    
      BEGIN
        EXITMAKE( 'NOT SCENARIO DISK')
      END;
      
      
    BEGIN (* MAKESCEN *)
      IF RTNESC( 'MAKE NEW SCENARIO DISKETTE', '') THEN
        EXIT( MAKESCEN);
      TITLESCR( 'MAKE NEW SCENARIO DISKETTE');
      WRITELN( 'PLACE ORIGINAL MASTER SCENARIO SIDE IN');
      WRITELN( 'DRIVE 2,  AND A  FORMATTED DISKETTE IN');
      WRITELN( 'DRIVE 1.');
      WRITELN;
      WRITELN( 'REMEMBER : ORIGINAL=2, NEW=1');
      PRESSRET;
      TITLESCR( 'MAKING SCENARIO - DO NOT DISTURB');
      SCNTOCBL := FINDFILE( DRIVE2, 'SCENARIO.DATA');
      IF SCNTOCBL < 0 THEN
        NOTSCEN;
      UNITREAD( DRIVE2, SERBUFF, SIZEOF( SERBUFF), SERIALBL, 0);
      IF IORESULT <> 0 THEN
        DSKERROR;
      IF SERBUFF[ 10] <> CHR( 0) THEN
        EXITMAKE( 'NOT MASTER IN 2');
      DUPIDX := ORD( SERBUFF[ 11]) + 1;
      IF DUPIDX = 256 THEN
        DUPIDX := 1;
      SERBUFF[ 11] := CHR( DUPIDX);
      UNITWRITE( DRIVE2, SERBUFF, SIZEOF( SERBUFF), SERIALBL, 0);
      IF IORESULT <> 0 THEN
        DSKERROR;
      FOR TEMPI := 0 TO 34 DO
        BEGIN
          UNITREAD( DRIVE2, IOCACHE, SIZEOF( IOCACHE), 8 * TEMPI, 0);
          IF IORESULT <> 0 THEN
            DSKERROR;
          UNITREAD( DRIVE2, IOCACHE2[ 0], SIZEOF( IOCACHE2),
                      8 * TEMPI + 2, 0);
          IF IORESULT <> 0 THEN
            DSKERROR;
          UNITWRITE( DRIVE1, IOCACHE, SIZEOF( IOCACHE), 8 * TEMPI, 0);
          IF IORESULT <> 0 THEN
            DSKERROR;
          UNITWRITE( DRIVE1, IOCACHE2[ 0], SIZEOF( IOCACHE2),
                       8 * TEMPI + 2, 0);
          IF IORESULT <> 0 THEN
            DSKERROR;
        END;
        
      SERBUFF[ 10] := SERBUFF[ 11];
      SERBUFF[ 11] := CHR( 0);
      SERBUFF[ 12] := CHR( (ORD( SERBUFF[ 12]) +  RANDNUM) MOD 256 );
      
      UNITWRITE( DRIVE1, SERBUFF, SIZEOF( SERBUFF), SERIALBL, 0);
      IF IORESULT <> 0 THEN
        DSKERROR;
      SCNTOCBL := FINDFILE( DRIVE1, 'SCENARIO.DATA');
      IF SCNTOCBL < 0 THEN
        NOTSCEN;
      RDSCNTC2;
      CHARREC0.STATUS := LOST;
      FOR TEMPI := 0 TO SCNTOC.RECPERDK[ ZCHAR] DO
        WRCHARAC( CHARREC0, TEMPI);
      WRICACHE;
      TITLESCR( 'MADE');
      PRESSRET
    END;
    
    
  PROCEDURE UPDATDSK;  (* P070120 *)
  
    VAR
        UNUSED  : INTEGER;
        TEMPI   : INTEGER;                  (* MULTIPLE USES *)
        CHARS20 : ARRAY [ 0..19] OF TCHAR;
        SERNUM  : STRING[ 6];               (* EVER USED PROPERLY? *)
        UNUSED2 : PACKED ARRAY [0..38] OF CHAR;
        IOBUF   : PACKED ARRAY [ 0..511] OF CHAR;
        BUF6BLK : PACKED ARRAY [ 0..3071] OF CHAR;
        
        
    PROCEDURE EXITUPD;  (* P070121 *)
    
      BEGIN
        TITLESCR( 'ERROR DURING UPDATE');
        WRITELN( 'UPDATE ABORTED' :27);
        PRESSRET;
        EXIT( UPDATDSK)
      END;
    
    
    PROCEDURE COPYDSK;  (* P070122 *)
    
      (* COPY ALL OF DISK FROM DRIVE 2 TO DRIVE 1,
         EXCEPT FOR THE SERIAL BLOCK (#5)          *)
    
    
      PROCEDURE COPYTRCK( BLOCKNUM : INTEGER);  (* P070123 *)
      
        BEGIN
          UNITREAD( DRIVE2, IOCACHE, SIZEOF( IOCACHE), BLOCKNUM, 0);
          IF IORESULT <> 0 THEN
            EXITUPD;
          UNITREAD( DRIVE2, BUF6BLK, SIZEOF( BUF6BLK), BLOCKNUM + 2, 0);
          IF IORESULT <> 0 THEN
            EXITUPD;
          UNITWRITE( DRIVE1, IOCACHE, SIZEOF( IOCACHE), BLOCKNUM, 0);
          IF IORESULT <> 0 THEN
            EXITUPD;
          UNITWRITE( DRIVE1, BUF6BLK, SIZEOF( BUF6BLK), BLOCKNUM + 2, 0);
          IF IORESULT <> 0 THEN
            EXITUPD
        END;
        
        
      BEGIN (* COPYDSK *)
        TITLESCR( 'UPDATING');
        UNITREAD( DRIVE2, BUF6BLK, 5 * 512, 0, 0);
        IF IORESULT <> 0 THEN
          EXITUPD;
        UNITWRITE( DRIVE1, BUF6BLK, 5 * 512, 0, 0);
        IF IORESULT <> 0 THEN
          EXITUPD;
          
        (* SKIP BLOCK 5, THE SERIAL BLOCK *)
          
        UNITREAD( DRIVE2, BUF6BLK, 1024, 6, 0);
        IF IORESULT <> 0 THEN
          EXITUPD;
        UNITWRITE( DRIVE1, BUF6BLK, 1024, 6, 0);
        IF IORESULT <> 0 THEN
          EXITUPD;
        FOR TEMPI := 1 TO 34 DO
            COPYTRCK( 8 * TEMPI)
      END;
      
      
    PROCEDURE UPDINSTR;  (* P070124 *)
    
      BEGIN
        IF RTNESC( 'UPDATE DISK', 
                   'WARNING - FOLLOW DIRECTIONS CAREFULLY') THEN
          EXIT( UPDATDSK);
        TITLESCR( 'STEP 1 - UPDATE BOOT SIDE');
        WRITELN( 'PUNCH WRITE-PROTECT NOTCH ON BOOT SIDE');
        WRITELN( 'OF OLD DISKETTE.');
        WRITELN;
        WRITELN( 'PLACE NEW BOOT SIDE IN DRIVE 2');
        WRITELN( '      OLD BOOT SIDE IN DRIVE 1');
        WRITELN;
        WRITELN( 'BE SURE : NEW=2, OLD=1; COPY 2 -> 1!');
        WRITELN;
        PRESSRET
      END;
      
      
    BEGIN (* UPDATDSK *)
      UPDINSTR;
      COPYDSK;
      UNITREAD( DRIVE1, IOBUF, SIZEOF( IOBUF), SERIALBL, 0);
      IF IORESULT <> 0 THEN
        EXITUPD;
      MOVELEFT( IOBUF, SERNUM, 7);
      IOBUF[ 10] := CHR( 0);
      IOBUF[ 11] := CHR( 1);
      IOBUF[ 12] := CHR( RANDNUM);
      UNITWRITE( DRIVE1, IOBUF, SIZEOF( IOBUF), SERIALBL, 0);
      IF IORESULT <> 0 THEN
        EXITUPD;
      REPEAT
        TITLESCR( 'STEP 2 - UPDATE SCENARIO SIDE');
        WRITELN( 'NOW FLIP BOTH DISKETTES SO WE CAN COPY');
        WRITELN( 'SCENARIO SIDES.');
        PRESSRET;
        SCNTOCBL := FINDFILE( DRIVE1, 'SCENARIO.DATA')
      UNTIL SCNTOCBL >= 0;
      RDSCNTC2;
      FOR TEMPI := 0 TO 19 DO
        RDCHARAC( CHARS20[ TEMPI], TEMPI);
      COPYDSK;
      SCNTOCBL := FINDFILE( DRIVE1, 'SCENARIO.DATA');
      RDSCNTC2;
      FOR TEMPI := 0 TO 19 DO
        BEGIN
          IF CHARS20[ TEMPI].AGE > 1250 THEN
            CHARS20[ TEMPI].AGE := 1250;
          CHARS20[ TEMPI].INMAZE := FALSE;
          WRCHARAC( CHARS20[ TEMPI], TEMPI);
        END;
      WRICACHE;
      UNITREAD( DRIVE1, IOBUF, SIZEOF( IOBUF), SERIALBL, 0);
      IF IORESULT <> 0 THEN
        EXITUPD;
      MOVELEFT( IOBUF, SERNUM, 7);  (* THIS LOOKS LIKE BUG *)
      IOBUF[ 10] := CHR( 0);
      IOBUF[ 11] := CHR( 1);
      IOBUF[ 12] := CHR( RANDNUM);
      UNITWRITE( DRIVE1, IOBUF, SIZEOF( IOBUF), SERIALBL, 0);
      IF IORESULT <> 0 THEN
        EXITUPD;
      TITLESCR( 'DISK UPDATED');
      WRITELN( 'REMEMBER TO PUT A WRITE-PROTECT TAB ON');
      WRITELN( 'THE NOTCH YOU PUNCHED!');
      PRESSRET
    END;
    
    

  BEGIN (* UTILS *)
    REPEAT
      TITLESCR( 'WIZARDRY UTILITIES');
      WRITELN;
      WRITELN(  'CHOOSE AN OPTION' :28);
      WRITELN;
      WRITELN(  'R)ECOVER  T)RANSFER B)ACKUP' :34);
      WRITELN;
      WRITELN(  'M)AKE SCENARIO DISK U)PDATE' :34);
      WRITELN;
      WRITELN(  'C)HANGE NAMES       L)EAVE ' :34);
      
      REPEAT
        GOTOXY( 41, 0);
        GETKEY
      UNTIL (INCHAR = 'R') OR (INCHAR = 'T') OR
            (INCHAR = 'L') OR (INCHAR = 'C') OR
            (INCHAR = 'B') OR (INCHAR = 'M') OR
            (INCHAR = 'U');
      
      CASE INCHAR OF
        'L':  EXITUTIL;
        'T':  TRANSFER;
        'R':  RECOVER;
        'C':  CHGNAMES;
        'B':  BACKUP;
        'M':  MAKESCEN;
        'U':  UPDATDSK;
      END
    UNTIL FALSE
  END; (* UTILS *)
  

(* ========================================================================== *)
(* DISK: Wiz1E.DSK | FILE: TITLELOA.TEXT                               *)
(* ========================================================================== *)

SEGMENT PROCEDURE TITLELOA;  (* P070201 *)

  TYPE
  
       BYTE = PACKED ARRAY [ 0..1] OF 0..255;
       
       MAGIC = RECORD CASE BOOLEAN OF
           FALSE : (I : INTEGER);
           TRUE  : (P : ^BYTE);
         END;

  VAR

       LZFLAG : INTEGER;
       STKPTR : ^INTEGER;
       WTBUFF : ARRAY[ 0..4607] OF INTEGER;  (* 9 BLOCKS == 18 SECTORS *)
       MEMORY : MAGIC;


  PROCEDURE SOFTSWTC( MEMLOC : INTEGER);  (* P070202 *)
  
    BEGIN
      MEMORY.I := MEMLOC;
      MEMORY.P^[ 0] := 0
    END;
    
    
  FUNCTION KEYPRESS : BOOLEAN;  (* P070203 *)
  
    BEGIN
      KEYPRESS := TRUE;
      MEMORY.I := -16384;  (* $C000  KEYBOARD DATA *)
      IF MEMORY.P^[ 0] > 127 THEN
        EXIT( KEYPRESS);
      MEMORY.I := -16616;  (* $BF18  PASCAL INPUT BUFFER *)
                           (* $BF19  PASCAL INPUT BUFFER *)
      IF MEMORY.P^[ 0] <> MEMORY.P^[ 1] THEN
        EXIT( KEYPRESS);
      KEYPRESS := FALSE
    END;
    
    
  PROCEDURE DSPTITLE;  (* P070204 *)
  
    VAR
        MP01 : INTEGER;
        MP02 : INTEGER;
        UNUSED : INTEGER;
        MP04 : INTEGER;
        MP05 : INTEGER;
  
  
    PROCEDURE CHKEYPR( LOOPCNT : INTEGER);  (* P070205 *)
    
      BEGIN
        GOTOXY( 41, 0);
        WHILE LOOPCNT > 0 DO
          BEGIN
            IF KEYPRESS THEN
              EXIT( DSPTITLE);
            LOOPCNT := LOOPCNT - 1
          END
      END;
      
      
    PROCEDURE P070206;
    
      BEGIN
        MP04 := 1 + (MP04 MOD 3);
        LZDECOMP( WTBUFF[ 0], WTBUFF[ MP04])
      END;
      
      
    PROCEDURE P070207;
    
      BEGIN
        MP05 := 5 + ((MP05 - 4) MOD 3);
        LZDECOMP( WTBUFF[ 0], WTBUFF[ MP05])
      END;
      
      
    BEGIN (* DSPTITLE *)
       LZDECOMP( WTBUFF[ 0], WTBUFF[ 8]);
       MEMORY.I := 8192;                (* $2000 *)
       FILLCHAR( MEMORY.P^, 8192, 0);   (* CLEAR HI RES SCREEN *)
       WRITE( CHR(12));                 (* CLEAR TEXT SCREEN *)
       
       GOTOXY( 12, 10);
       WRITE( 'PREPARE YOURSELF');
       CHKEYPR( 150);                   (* CHECK 150 TIMES FOR KEY PRESS *)
       GOTOXY( 12, 12);
       WRITE( 'FOR THE ULTIMATE');
       CHKEYPR( 150);                   (* CHECK 150 TIMES FOR KEY PRESS *)
       GOTOXY( 12, 14);
       WRITE( 'IN FANTASY GAMES');
       CHKEYPR( 500);                   (* CHECK 500 TIMES FOR KEY PRESS *)
       
       SOFTSWTC( -16300);  (* PRIMARY PAGE     *)
       SOFTSWTC( -16297);  (* HI RES           *)
       SOFTSWTC( -16302);  (* ALL GRAPHICS     *)
       SOFTSWTC( -16304);  (* DISPLAY GRAPHICS *)
       
       WRITE( CHR( 12)); (* CLEAR TEXT SCREEN *)
       GOTOXY( 41, 0);   (* MOVE CURSOR OFF SCREEN *)
       
       LZDECOMP( WTBUFF[ 0], WTBUFF[ 0]);
       MP04 := 0;
       MP05 := 4;
       FOR MP02 := 1 TO 20 DO
         BEGIN
           CHKEYPR( 15);
           P070206
         END;
         
       FOR MP02 := 1 TO 24 DO 
         BEGIN
           FOR MP01 := 1 TO 2 DO
             BEGIN
               CHKEYPR( 12);
               P070206
             END;
           P070207
         END;
         
       LZDECOMP( WTBUFF[ 0], WTBUFF[ 8]);
       P070206;
       FOR MP02 := 9 TO 23 DO
         BEGIN
           FOR MP01 := 1 TO 2 DO
             BEGIN
               CHKEYPR( 5 + MP02);
               P070206
             END;
           LZDECOMP( WTBUFF[ 0], WTBUFF[ MP02])
         END;
         
       FOR MP02 := 24 TO 32 DO
         BEGIN
           FOR MP01 := 1 TO 4 DO 
             BEGIN
               CHKEYPR( 10);
               P070206
             END;
           LZDECOMP( WTBUFF[ 0], WTBUFF[ MP02])
         END;
         
       FOR MP02 := 1 TO 40 DO
         BEGIN
           CHKEYPR( 12);
           P070206
         END;
         
       FOR MP02 := 1 TO 80 DO
         BEGIN
           LZDECOMP( LZFLAG, 0);
           CHKEYPR( 7);
           P070206
         END;
         
       FOR MP02 := 1 TO 40 DO
         BEGIN
           CHKEYPR( 12);
           P070206
         END
    END;
    
    
  PROCEDURE READWT;  (* P070208 *)
  
    VAR
        FILE1 : FILE; (* UNTYPED FILE *)
        
  
    BEGIN
      RESET( FILE1, 'WT');  (* WIZARDRY TITLE SCREEN *)
      BASE04 := BLOCKREAD( FILE1, WTBUFF, 18, 0);
      CLOSE( FILE1)
    END;



  BEGIN  (* TITLELOA *)
  
    SETCHAIN( 'WIZARDRY');
    READWT;               (* READ WIZARDRY TITLE FILE *)
    MARK( STKPTR);
    MEMORY.I := 16384;    (* $4000 PROTECT HI RES SCREEN *)
    RELEASE( MEMORY.P);
    LZFLAG := 253;
    
    REPEAT
      DSPTITLE;           (* DISPLAY TITLE ANIMATION AND CHECK KEYPRESS *)
      IF LZFLAG = 253 THEN
         LZFLAG := 254
      ELSE
         LZFLAG := 253;
      SOFTSWTC( -16300);  (* DISPLAY PRIMARY PAGE *)
      SOFTSWTC( -16303)   (* DISPLAY TEXT *)
    UNTIL KEYPRESS;
    
    WRITE( CHR( 32));  (* SPACE CHARACTER *)
    UNITCLEAR( 1);     (* FLUSH TYPE AHEAD BUFFER; RESET TO LEFT 40 COLS *)
    RELEASE( STKPTR)
  END;  (* TITLELOA *)


(* ========================================================================== *)
(* DISK: Wiz1E.DSK | FILE: OPTIONS.TEXT                                *)
(* ========================================================================== *)

SEGMENT PROCEDURE OPTIONS;  (* P070301 *)

  CONST 
        HOMECLR = 12;

  VAR   
        IOBUFF : PACKED ARRAY[ 0..511] OF CHAR;
    
  BEGIN
    
    UNITREAD( DRIVE1, IOBUFF, SIZEOF( IOBUFF), 0, 0);
    UNITWRITE( DRIVE1, IOBUFF, SIZEOF( IOBUFF), 0, 0);
    
    IF IORESULT <> 16 THEN
      REPEAT
      UNTIL FALSE;
      
    WRITE( CHR( HOMECLR));
    
    WRITELN( 'COPYRIGHT (C)1981 ALL RIGHTS RESERVED BY');
    WRITELN( 'ANDREW GREENBERG, INC & ROBERT WOODHEAD,');
    WRITELN( 'INC.  THIS PROGRAM  IS  PROTECTED  UNDER');
    WRITELN( 'THE LAWS OF THE UNITED STATES  AND OTHER');
    WRITELN( 'COUNTRIES,  AND ILLEGAL DISTRIBUTION MAY');
    WRITELN( 'RESULT IN CIVIL  LIABILITY  AND CRIMINAL');
    WRITELN( 'PROSECUTION.');
    
    GOTOXY( 0, 12);
    
    WRITE( '  VERSION 2.1 OF 22-JAN-82  SER:');
    WRITELN( SERIAL);
    WRITELN;
    WRITELN;
    
    WRITE( '  S)TART GAME  U)TILITIES  T)ITLE PAGE');
    
    REPEAT
      GOTOXY( 41,0);
      READ( INCHAR)
    UNTIL (INCHAR = 'S') OR (INCHAR = 'U') OR (INCHAR = 'T')
  END;

(* ========================================================================== *)
(* DISK: Wiz1E.DSK | FILE: LZDECOMP.TEXT                               *)
(* ========================================================================== *)

 .PROC LZDECOMP,2 ; P070002,2 ; 2 PARAMETERS
;
 .REF L04BC, L057C
;
;                 ; CALL:  LZDECOMP( A1, A2);
;                 ;          A1 BY VAR, A2 BY VALUE.
;                 ;          A2 IS AN INDEX INTO A1.
;                 ;
;                 ;
;                 ;
SPCHAR .EQU 0BF1C ; SEE APPLE II COMPUTER TECHNICAL INFORMATION
;                 ; (ATTACH-BIOS DOCUMENT FOR APPLE II PASCAL 1.1)
;                 ; (ATTACH.PDF)
;                 ;
;                 ; CONTROL SPECIAL CHARACTERS ON INPUT
;
 PLA      ; PULL RETURN
 TAX      ; XY := RETURN ADDRESS
 PLA
 TAY
;
 PLA      ; 00.01 := PARM 2
 STA 00
 PLA
 STA 01
;
 PLA      ; 02.03 := PARM 1
 STA 02
 PLA
 STA 03
;
 TYA      ; PUSH RETURN
 PHA
 TXA
 PHA
;
 CLC      ; 02.03 := 02.03 + 00.01
 LDA 02
 ADC 00   ;    PARM 2 IS AN INDEX INTO PARM 1
 STA 02
 LDA 03
 ADC 01
 STA 03
;
 LDX #00
 LDA #03     ; DONT CHECK FOR APPLE PASCAL SPECIAL CHARS ON KEYBOARD INPUT
 ORA SPCHAR  ;   CTRL-A, Z, W, E, K,  CTRL-S, F
 STA SPCHAR  ;
;
L5145
L002B
 LDA @02,X
 CMP #0C0
 BCC L5181
 CMP #0FD
 BCC L5152
 JMP L0132 ; L524C
L5152
 SEC
 SBC #0C0
 STA 07
 LDY #02
 LDA @02,Y
 STA 06
 DEY
 LDA @02,Y
 TAY
 LDA L04BC,Y    ; 04.05 POINTER TO HI RES SCREEN LEFT EDGE
 STA 04
 LDA L057C,Y
 STA 05
 LDY 07
 LDA 06
 STA @04,Y
 CLC
 LDA 02
 ADC #03
 STA 02
 LDA #00
 ADC 03
 STA 03
 JMP L002B ; L5145  L51D1
L5181
 TAY
 LDA L04BC,Y    ; 04.05 POINTER TO HI RES SCREEN LEFT EDGE
 STA 04
 LDA L057C,Y
 STA 05
 LDY #01
 LDA @02,Y
 STA 06
 INY
 LDA @02,Y
 STA 07
 INY
 LDA @02,Y
 STA 08
 INY
 LDA @02,Y
 STA 09
 INY
 LDA @02,Y
 STA 0A
 CLC
 LDA 02
 ADC #06
 STA 02
 LDA 03
 ADC #00
 STA 03
 LDY #00
 LDA 06
 JSR L00B7 ; L51D1
 LDA 07
 JSR L00B7
 LDA 08
 JSR L00B7
 LDA 09
 JSR L00B7
 LDA 0A
 JSR L00B7
 JMP L002B ; L5145
L51D1
L00B7
 STA 00
 LSR 00
 BCC L51E1
 LDA @02,X
 STA @04,Y
 INC 02
 BNE L51E1
 INC 03
L51E1
 INY
 LSR 00
 BCC L51F0
 LDA @02,X
 STA @04,Y
 INC 02
 BNE L51F0
 INC 03
L51F0
 INY
 LSR 00
 BCC L51FF
 LDA @02,X
 STA @04,Y
 INC 02
 BNE L51FF
 INC 03
L51FF
 INY
 LSR 00
 BCC L520E
 LDA @02,X
 STA @04,Y
 INC 02
 BNE L520E
 INC 03
L520E
 INY
 LSR 00
 BCC L521D
 LDA @02,X
 STA @04,Y
 INC 02
 BNE L521D
 INC 03
L521D
 INY
 LSR 00
 BCC L522C
 LDA @02,X
 STA @04,Y
 INC 02
 BNE L522C
 INC 03
L522C
 INY
 LSR 00
 BCC L523B
 LDA @02,X
 STA @04,Y
 INC 02
 BNE L523B
 INC 03
L523B
 INY
 LSR 00
 BCC L524A
 LDA @02,X
 STA @04,Y
 INC 02
 BNE L524A
 INC 03
L524A
 INY
 RTS
L524C
L0132
 CMP #0FE
 BEQ L5255
 CMP #0FD
 BEQ L5264
 RTS
L5255
 LDA #030
 STA 09
L5259
 JSR L0177 ; L5291
 DEC 09
 BNE L5259
 JSR L0177
 RTS
L5264
 LDA #030
 STA 09
L5268
 JSR L0159 ; L5273
 DEC 09
 BNE L5268
 JSR L0159
 RTS
L5273
L0159
 LDY 09
 LDA L04BC,Y    ; 04.05 POINTER TO HI RES SCREEN LEFT EDGE
 STA 04
 LDA L057C,Y
 STA 05
 LDY #027
L5281
 LDA @04,Y
 EOR #080
 STA @04,Y
 DEY
 BNE L5281
 LDA @04,Y
 EOR #080
 STA @04,Y
 RTS
L5291
L0177
 CLC
 LDY 09
 LDA L04BC,Y    ; 04.05 POINTER TO HI RES SCREEN LEFT EDGE
 STA 04
 ADC #01        ; 06.07 POINTER TO HI RES SCREEN LEFT EDGE + 1
 STA 06
 LDA L057C,Y
 STA 05
 ADC #00
 STA 07
 LDY #00
 LDA @04,Y
 STA 08
 LDX #027
L52AE
 LDA @06,Y
 STA @04,Y
 INY
 DEX
 BNE L52AE
 LDA 08
 STA @04,Y
 RTS
;
 .END
 

(* ========================================================================== *)
(* DISK: Wiz1E.DSK | FILE: CHKSYNCH.TEXT                               *)
(* ========================================================================== *)

 .PROC CHKSYNCH,1 ;     P070003,1 ; 1 PARAMETER
;
;
;            ; CALL:  CHKSYNCH( VAR RESULT);
;            ;          RESULT IS AN INTEGER THAT GETS THE RESULT.
;            ;
;            ; PURPOSE:  COPY PROTECTION BY CHECKING SYNCHRONIZATION 
;            ;           BETWEEN TRACKS.
;            ;
;            ; 1. READ SECTOR 0 ADDRESS FIELD PROLOGUE ON CURRENT TRACK.
;            ; 2. MOVE DISK ARM TO NEXT HIGHER NUMBERED TRACK.
;            ; 3. COUNT NUMBER OF NIBBLES UNTIL SECTOR 0
;            ;      ADDRESS FIELD PROLOGUE ON THIS TRACK IS READ.
;            ; 4. RETURN COUNT.
;            ;
;            ; SEE ALSO SCENARIO.DATA.  SIMILAR COPY PROTECTION CODE
;            ; RESIDES THERE TOO, AND IS USED IN WIZARDRY.CODE.
;
 PLA         ; PULL RETURN
 STA 00
 PLA
 STA 01
;
 PLA         ; 02.03 := POINTER TO RESULT (TRACK SYNCH VALUE)
 STA 02
 PLA
 STA 03
;
 LDA 01      ; PUSH RETURN
 PHA
 LDA 00
 PHA
;
 LDA #0      ; INIT SYNCH COUNT VALUE
 STA 0D      ; 0D.0E
 STA 0E      ;
;
 LDX #060     ; SLOT# * 16   (SLOT 6)
 LDA 0C08A,X  ; DRIVE #1
 LDA 0C089,X  ; MOTOR ON
 LDA 0C08E,X  ; PREPARE LATCH FOR INPUT
;
L5313
 LDA 0C08C,X  ; READ A BYTE
 BPL L5313
 CMP #0FF     ;   #$FF
 BNE L5313
L531C
 LDA 0C08C,X  ; READ A BYTE
 BPL L531C
 CMP #0FF     ;   #$FF
 BNE L5313
L0035
 LDA 0C08C,X  ; READ A BYTE
 BPL L0035
 CMP #0FF     ;   #$FF
 BNE L5331
 JMP L0035
;
L5331
 LDA 0C08C,X  ; READ A BYTE
 BPL L5331
 CMP#0D5      ;   #$D5
 BNE L5331
L533A
 LDA 0C08C,X  ; READ
 BPL L533A
 CMP #0AA     ;   #$AA
 BNE L5331
L5343
 LDA 0C08C,X  ; READ
 BPL L5343
 CMP #096     ;   #$96
 BNE L5331
;
;             ; WE HAVE JUST READ AN ADDRESS FIELD PROLOGUE (D5 AA 96)
;
L534C
 LDA 0C08C,X  ; READ
 BPL L534C
 NOP          ;   VOLUME (IGNORED)
 NOP
 NOP
 NOP
 NOP
L5356
 LDA 0C08C,X  ; READ
 BPL L5356
 NOP          ;   VOLUME (IGNORED)
 NOP
 NOP
 NOP
 NOP
L5360
 LDA 0C08C,X  ; READ
 BPL L5360
 NOP          ;   TRACK (IGNORED)
 NOP
 NOP
 NOP
 NOP
L536A
 LDA 0C08C,X  ; READ
 BPL L536A
 NOP          ;   TRACK (IGNORED)
 NOP
 NOP
 NOP
 NOP
L5374
 LDA 0C08C,X  ; READ
 BPL L5374
 TAY          ;   SECTOR
 NOP
 NOP
 NOP
 NOP
 NOP
L537F
 LDA 0C08C,X  ; READ
 BPL L537F
 STA 04       ;   SECTOR
 TYA
 SEC
 ROL A
 AND 04       ; A = SECTOR VALUE
 CMP #00      ; SECTOR 0?
 BNE L5313    ; NO, L5313.  TRY UNTIL WE GET SECTOR 0
;
;             ; WE HAVE JUST READ SECTOR 0 ADDRESS FIELD
;
 JSR L011B    ; MOVETRACK.  MOVE DISK ARM INWARD TO NEXT HIGHER NUMBERED TRACK
;
L00A2
L5392
 LDA 0C08C,X  ; READ
 BPL L5392
 CMP #0D5     ; #$D5?
 BEQ L53A4    ;   YES, L53A4
              ;   NO
 INC 0D       ; 0D.0E COUNT MOST NIBBLES UNTIL WE READ SECTOR 0 PROLOGUE
 BNE L5392    ;
 INC 0E       ; 0D IS LOW ORDER, 0E IS HIGH ORDER
 JMP L00A2
L53A4
 LDA 0C08C,X  ; READ
 BPL L53A4
 CMP #0AA     ;   #$AA
 BNE L5392
L53AD
 LDA 0C08C,X  ; READ
 BPL L53AD
 CMP #096     ;   #$96
 BNE L5392
L53B6
 LDA 0C08C,X  ; READ
 BPL L53B6
 NOP          ;   VOL
 NOP
 NOP
 NOP
 NOP
L53C0
 LDA 0C08C,X  ; READ
 BPL L53C0
 NOP          ;   VOL
 NOP
 NOP
 NOP
 NOP
L53CA
 LDA 0C08C,X  ; READ
 BPL L53CA
 NOP          ;   TRACK
 NOP
 NOP
 NOP
 NOP
L53D4
 LDA 0C08C,X  ; READ
 BPL L53D4
 NOP          ;   TRACK
 NOP
 NOP
 NOP
 NOP
L53DE
 LDA 0C08C,X  ; READ
 BPL L53DE
 TAY          ;   SECTOR
 NOP
 NOP
 NOP
 NOP
 NOP
L53E9
 LDA 0C08C,X  ; READ
 BPL L53E9
 STA 04       ;   SECTOR
 TYA
 SEC
 ROL A
 AND 04       ; SECTOR
 CMP #0       ; 0?
 BEQ L53FC    ;   YES, L53FC
 JMP L00A2    ;   NO,  L00A2 AND TRY AGAIN
;
L53FC
 LDY #0       ; ALL DONE
 LDA 0D       ; STORE RESULTS AT PASSED POINTER
 STA @02,Y    ; 0D.0E IS COUNT OF NIBBLES BEFORE SECTOR 0 WAS
 INY          ;   READ ON ADJACENT TRACK.
 LDA 0E
 STA @02,Y
 LDA 0C088,X  ; MOTOR OFF
 RTS
; ----------------------------------------------------------------------------
;
L011B
;              NAME:  L011B   (SIMILAR TO SEEKABS)
;           PURPOSE:  MOVE DISK ARM TO NEXT HIGHER NUMBERED TRACK
;              CALL:  LDX #$60;    SLOT# * 16
;                     JSR $L011B
;
;
 STX 06    ; 06 := SLOT# * 16
 LDY #0C   ; DESIRED TRACK #$0C       (ASSUMED VALUE; NOT ALWAYS TRUE)
 STY 07    ; 07 := DESIRED TRACK
 DEY       ; CALCULATE CURRENT TRACK
 DEY       ; THESE ARE 1/2 TRACK INCREMENTS
 STY 08    ; 08 := CURRENT TRACK #$0A (ASSUMED VALUE; NOT ALWAYS TRUE)
;
 LDA #0EF  ; INITIAL DELAY TIME SET TO $D8EF
 STA 0B
 LDA #0D8
 STA 0C
;
 LDA #0    ; 09 := #0   1/2 TRACKS MOVED COUNT
 STA 09
;
;          ; THE REST OF THIS CODE IS NEARLY IDENTICAL TO THE DOS CODE
;          ; FOR SEEKABS.  THE ONLY DIFFERENCE IS IN THE LOCATION
;          ; OF THE VARIOUS "VARIABLES".
;          ;
;          ;   07 =    DESIRED TRACK
;          ;   08 =    CURRENT TRACK
;          ;   09 =    1/2 TRACKS MOVED
;          ;   0A =    PRIOR 1/2 TRACK
;          ;   0B.0C = DELAY TIME
L5421
 LDA 08    ; CURRENT TRACK - DESIRED TRACK = ...
 STA 0A    ; SAVE PRIOR 1/2 TRACK BEFORE MOVE
 SEC       ;
 SBC 07    ; ...DISTANCE AWAY AND DIRECTION TO MOVE
 BEQ L545B ; SAME TRACK?  YES,
 BCS L5432 ; MOVE INWARD OR OUTWARD?
 EOR #0FF  ; INWARD (TO A BIGGER #)     ADD +1
 INC 08    ; CURRENT TRACK AFTER ARM MOVES
 BCC L5436
L5432
 ADC #0FE  ; OUTWARD (TO A SMALLER #)   ADD -1
 DEC 08    ; CURRENT TRACK AFTER ARM MOVES
           ;   A = # OF 1/2 TRACKS STILL TO MOVE
L5436
 CMP 09
 BCC L543C
 LDA 09
L543C
 CMP #0C
 BCS L5441
 TAY
L5441
 SEC         ; C=1
 JSR L016F   ; TURN PHASE ON (CURRENT TRACK)
 LDA L0191,Y
 JSR L0180   ; MSWAIT
 LDA 0A
 CLC         ; C=0
 JSR L0171
 LDA L019D,Y
 JSR L0180   ; MSWAIT
 INC 09
 BNE L5421
;
L545B
 JSR L0180   ; MSWAIT
 CLC
L016F
 LDA 08
L0171
 AND #03
 ROL A
 ORA 06
 TAX
 LDA 0C080,X  ; STEPPER MOTOR PHASES
 LDX 06
 RTS
;
 TAX
 LDY #0A0
;
L0180
L5470
;
;             ; ARM MOVE DELAY
;
 LDX #011
L5472
 DEX
 BNE L5472
 INC 0B
 BNE L547B
 INC 0C
L547B
 SEC
 SBC #01
 BNE L5470
 RTS
;
;              ; ARM MOVE DELAY TABLE
;
;              ;  DOS HAS 01 30 28 24 20 1E
;              ;                   --
;              ;
; ONTABLE
L0191 .BYTE 001,030,028,020,020,01E,01D,01C,01C,01C,01C,01C
;
; OFFTABLE
L019D .BYTE 070,02C,026,022,01F,01E,01D,01C,01C,01C,01C,01C
 .BYTE 000
 .END


(* ========================================================================== *)
(* DISK: Wiz1E.DSK | FILE: SCREENPT.TEXT                               *)
(* ========================================================================== *)

 .PROC SCREENPT ; P070005 ; LZDECOMP USES THESE TABLES
;
 .DEF L04BC, L057C
;
;
;        ; POINTERS TO LEFT EDGE OF PRIMARY HI RES SCREEN
L54BC
L04BC
 .BYTE 000,000,000,000,000,000,000,000
 .BYTE 080,080,080,080,080,080,080,080
 .BYTE 000,000,000,000,000,000,000,000
 .BYTE 080,080,080,080,080,080,080,080
 .BYTE 000,000,000,000,000,000,000,000
 .BYTE 080,080,080,080,080,080,080,080
 .BYTE 000,000,000,000,000,000,000,000
 .BYTE 080,080,080,080,080,080,080,080
;
 .BYTE 028,028,028,028,028,028,028,028
 .BYTE 0A8,0A8,0A8,0A8,0A8,0A8,0A8,0A8
 .BYTE 028,028,028,028,028,028,028,028
 .BYTE 0A8,0A8,0A8,0A8,0A8,0A8,0A8,0A8
 .BYTE 028,028,028,028,028,028,028,028
 .BYTE 0A8,0A8,0A8,0A8,0A8,0A8,0A8,0A8
 .BYTE 028,028,028,028,028,028,028,028
 .BYTE 0A8,0A8,0A8,0A8,0A8,0A8,0A8,0A8
;
 .BYTE 050,050,050,050,050,050,050,050
 .BYTE 0D0,0D0,0D0,0D0,0D0,0D0,0D0,0D0
 .BYTE 050,050,050,050,050,050,050,050
 .BYTE 0D0,0D0,0D0,0D0,0D0,0D0,0D0,0D0
 .BYTE 050,050,050,050,050,050,050,050
 .BYTE 0D0,0D0,0D0,0D0,0D0,0D0,0D0,0D0
 .BYTE 050,050,050,050,050,050,050,050
 .BYTE 0D0,0D0,0D0,0D0,0D0,0D0,0D0,0D0
L557C
L057C
 .BYTE 020,024,028,02C,030,034,038,03C
 .BYTE 020,024,028,02C,030,034,038,03C
 .BYTE 021,025,029,02D,031,035,039,03D
 .BYTE 021,025,029,02D,031,035,039,03D
 .BYTE 022,026,02A,02E,032,036,03A,03E
 .BYTE 022,026,02A,02E,032,036,03A,03E
 .BYTE 023,027,02B,02F,033,037,03B,03F
 .BYTE 023,027,02B,02F,033,037,03B,03F
;
 .BYTE 020,024,028,02C,030,034,038,03C
 .BYTE 020,024,028,02C,030,034,038,03C
 .BYTE 021,025,029,02D,031,035,039,03D
 .BYTE 021,025,029,02D,031,035,039,03D
 .BYTE 022,026,02A,02E,032,036,03A,03E
 .BYTE 022,026,02A,02E,032,036,03A,03E
 .BYTE 023,027,02B,02F,033,037,03B,03F
 .BYTE 023,027,02B,02F,033,037,03B,03F
L55FC
 .BYTE 020,024,028,02C,030,034,038,03C
 .BYTE 020,024,028,02C,030,034,038,03C
 .BYTE 021,025,029,02D,031,035,039,03D
 .BYTE 021,025,029,02D,031,035,039,03D
 .BYTE 022,026,02A,02E,032,036,03A,03E
 .BYTE 022,026,02A,02E,032,036,03A,03E
 .BYTE 023,027,02B,02F,033,037,03B,03F
 .BYTE 023,027,02B,02F,033,037,03B,03F
;
 .END
 
