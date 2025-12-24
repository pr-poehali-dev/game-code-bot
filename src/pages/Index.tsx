import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface GeneratedGame {
  id: string;
  prompt: string;
  code: string;
  timestamp: Date;
  complexity: number;
  isFavorite?: boolean;
}

const EXAMPLE_PROMPTS = [
  { title: '🐍 Змейка', prompt: 'Создай классическую игру змейка с управлением стрелками', complexity: 2, gradient: 'from-green-500 to-emerald-600' },
  { title: '❌ Крестики-нолики', prompt: 'Игра крестики-нолики 3x3 против компьютера', complexity: 1, gradient: 'from-blue-500 to-cyan-600' },
  { title: '🐦 Flappy Bird', prompt: 'Игра как Flappy Bird с препятствиями', complexity: 3, gradient: 'from-yellow-500 to-orange-600' },
  { title: '🏃 Платформер', prompt: 'Простой 2D платформер с прыжками и монетами', complexity: 4, gradient: 'from-purple-500 to-pink-600' },
  { title: '🏓 Пинг-понг', prompt: 'Классический пинг-понг на двоих игроков', complexity: 2, gradient: 'from-red-500 to-rose-600' },
  { title: '🃏 Memory Game', prompt: 'Игра на память с переворачивающимися карточками', complexity: 1, gradient: 'from-indigo-500 to-purple-600' },
  { title: '🎯 Дартс', prompt: 'Игра дартс с прицеливанием и очками', complexity: 2, gradient: 'from-teal-500 to-cyan-600' },
  { title: '🧩 Тетрис', prompt: 'Классический тетрис с падающими блоками', complexity: 3, gradient: 'from-fuchsia-500 to-pink-600' }
];

const MatrixRain = () => {
  useEffect(() => {
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノ';
    const container = document.getElementById('matrix-container');
    if (!container) return;

    const createChar = () => {
      const char = document.createElement('div');
      char.className = 'matrix-char';
      char.textContent = chars[Math.floor(Math.random() * chars.length)];
      char.style.left = Math.random() * 100 + '%';
      char.style.fontSize = Math.random() * 10 + 10 + 'px';
      char.style.animationDuration = Math.random() * 3 + 2 + 's';
      char.style.animationDelay = Math.random() * 2 + 's';
      container.appendChild(char);

      setTimeout(() => {
        char.remove();
      }, 5000);
    };

    const interval = setInterval(createChar, 100);
    return () => clearInterval(interval);
  }, []);

  return <div id="matrix-container" className="fixed inset-0 overflow-hidden pointer-events-none opacity-20 z-0" />;
};

const Index = () => {
  const [prompt, setPrompt] = useState('');
  const [complexity, setComplexity] = useState([2]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentGame, setCurrentGame] = useState<GeneratedGame | null>(null);
  const [gameHistory, setGameHistory] = useState<GeneratedGame[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState('generator');

  const generateGame = async () => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      toast.error('Введите описание игры');
      return;
    }
    
    if (trimmedPrompt.length < 3) {
      toast.error('Опишите игру хотя бы в 3 символах');
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('https://functions.poehali.dev/d97eb061-8f1b-4d84-ac12-ca2513891886', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          complexity: complexity[0]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка генерации');
      }

      const data = await response.json();

      const newGame: GeneratedGame = {
        id: Date.now().toString(),
        prompt: data.prompt,
        code: data.code,
        timestamp: new Date(),
        complexity: data.complexity
      };

      setCurrentGame(newGame);
      setGameHistory([newGame, ...gameHistory]);
      toast.success('Игра сгенерирована Gemini!');
    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error(error.message || 'Ошибка при генерации игры');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyCode = () => {
    if (currentGame) {
      navigator.clipboard.writeText(currentGame.code);
      toast.success('Код скопирован в буфер обмена');
    }
  };

  const playGame = () => {
    if (currentGame) {
      const blob = new Blob([currentGame.code], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setIsPlaying(true);
    }
  };

  const loadExample = (examplePrompt: string, exampleComplexity: number) => {
    setPrompt(examplePrompt);
    setComplexity([exampleComplexity]);
    toast.success('Пример загружен');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <MatrixRain />
      
      <div className="relative z-10 container mx-auto py-8 px-4">
        <header className="text-center mb-12 relative">
          <div className="inline-flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center neon-border animate-pulse">
              <Icon name="Zap" size={32} className="text-background" />
            </div>
          </div>
          <h1 className="text-6xl md:text-7xl font-black mb-4 neon-text tracking-tight">
            GAME FORGE
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-4">
            Создавай игры силой мысли
          </p>
          <div className="flex items-center justify-center gap-3">
            <Badge variant="outline" className="border-accent text-accent px-4 py-1.5 text-sm">
              <Icon name="Sparkles" size={14} className="mr-1.5" />
              Powered by Gemini
            </Badge>
            <Badge variant="outline" className="border-primary text-primary px-4 py-1.5 text-sm">
              {gameHistory.length} игр создано
            </Badge>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="inline-flex bg-card/80 backdrop-blur border border-primary/20 p-1.5 rounded-2xl">
              <TabsTrigger value="generator" className="data-[state=active]:bg-primary data-[state=active]:text-background rounded-xl px-6">
                <Icon name="Sparkles" size={18} className="mr-2" />
                Генератор
              </TabsTrigger>
              <TabsTrigger value="examples" className="data-[state=active]:bg-primary data-[state=active]:text-background rounded-xl px-6">
                <Icon name="Lightbulb" size={18} className="mr-2" />
                Примеры
              </TabsTrigger>
              <TabsTrigger value="library" className="data-[state=active]:bg-primary data-[state=active]:text-background rounded-xl px-6">
                <Icon name="Library" size={18} className="mr-2" />
                Библиотека
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-background rounded-xl px-6">
                <Icon name="History" size={18} className="mr-2" />
                История
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="generator" className="space-y-6 animate-fade-in">
            <Card className="p-8 bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-xl border-2 border-primary/30 rounded-3xl shadow-2xl">
              <div className="space-y-6">
                <div className="relative">
                  <label className="text-2xl font-black mb-4 block flex items-center text-primary">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mr-3">
                      <Icon name="MessageSquare" size={20} />
                    </div>
                    Опиши свою игру
                  </label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Например: змейка с неоновой графикой или space shooter с астероидами..."
                    className="min-h-40 bg-input/50 border-2 border-primary/30 focus:border-primary text-foreground text-lg rounded-2xl resize-none transition-all"
                  />
                  <div className="absolute bottom-4 right-4 text-xs text-muted-foreground">
                    {prompt.length} символов
                  </div>
                </div>

                <div className="p-6 bg-input/20 rounded-2xl border border-primary/20">
                  <label className="text-xl font-bold mb-4 block flex items-center justify-between">
                    <span className="flex items-center text-primary">
                      <Icon name="Gauge" size={22} className="mr-2" />
                      Сложность игры
                    </span>
                    <Badge className="bg-gradient-to-r from-primary to-accent text-background px-4 py-1.5 text-base font-bold">
                      Уровень {complexity[0]}
                    </Badge>
                  </label>
                  <Slider
                    value={complexity}
                    onValueChange={setComplexity}
                    min={1}
                    max={5}
                    step={1}
                    className="w-full my-6"
                  />
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-green-400">🟢 Простая</span>
                    <span className="text-yellow-400">🟡 Средняя</span>
                    <span className="text-red-400">🔴 Сложная</span>
                  </div>
                </div>

                <Button
                  onClick={generateGame}
                  disabled={isGenerating}
                  className="w-full h-16 text-xl font-black bg-gradient-to-r from-primary via-accent to-secondary hover:opacity-90 transition-all rounded-2xl neon-border shadow-lg hover:shadow-primary/50 hover:scale-[1.02]"
                >
                  {isGenerating ? (
                    <>
                      <Icon name="Loader2" className="mr-3 animate-spin" size={28} />
                      Магия происходит...
                    </>
                  ) : (
                    <>
                      <Icon name="Zap" className="mr-3" size={28} />
                      Создать игру сейчас
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {currentGame && (
              <Card className="p-8 bg-gradient-to-br from-accent/20 to-secondary/20 backdrop-blur-xl border-2 border-accent/50 rounded-3xl animate-fade-in shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-3xl font-black flex items-center text-accent">
                    <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mr-3 animate-pulse">
                      <Icon name="Check" size={24} />
                    </div>
                    Игра готова!
                  </h3>
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 text-base">
                    ✅ Сгенерировано
                  </Badge>
                </div>
                
                <div className="bg-background/50 p-6 rounded-2xl border-2 border-primary/20 mb-6 max-h-72 overflow-auto">
                  <pre className="text-sm text-foreground/90 font-mono whitespace-pre-wrap break-words leading-relaxed">
                    {currentGame.code}
                  </pre>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Button
                    onClick={playGame}
                    className="h-14 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 rounded-xl shadow-lg hover:scale-105 transition-all"
                  >
                    <Icon name="Play" className="mr-2" size={22} />
                    Играть
                  </Button>
                  <Button
                    onClick={copyCode}
                    variant="outline"
                    className="h-14 text-lg font-bold border-2 border-secondary hover:bg-secondary/20 rounded-xl hover:scale-105 transition-all"
                  >
                    <Icon name="Copy" className="mr-2" size={22} />
                    Копировать
                  </Button>
                  <Button
                    onClick={() => saveToLibrary(currentGame)}
                    variant="outline"
                    className="h-14 text-lg font-bold border-2 border-primary hover:bg-primary/20 rounded-xl hover:scale-105 transition-all"
                  >
                    <Icon name="Heart" className="mr-2" size={22} />
                    Сохранить
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card className="p-6 bg-card/80 backdrop-blur neon-border">
              <h3 className="text-2xl font-bold mb-4 flex items-center">
                <Icon name="History" size={24} className="mr-2" />
                История генераций
              </h3>
              
              {gameHistory.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">История пуста. Создайте первую игру!</p>
              ) : (
                <div className="space-y-3">
                  {gameHistory.map((game) => (
                    <div
                      key={game.id}
                      className="p-4 bg-input/30 rounded-lg border border-primary/20 hover:border-primary/50 transition cursor-pointer"
                      onClick={() => setCurrentGame(game)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-bold">{game.prompt}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {game.timestamp.toLocaleString('ru-RU')}
                          </p>
                        </div>
                        <div className="flex gap-2 items-center">
                          <Badge variant="outline" className="border-primary text-primary">
                            Ур. {game.complexity}
                          </Badge>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              saveToLibrary(game);
                            }}
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-primary/20"
                          >
                            <Icon name="Heart" size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="library" className="space-y-4">
            <Card className="p-6 bg-card/80 backdrop-blur neon-border">
              <h3 className="text-2xl font-bold mb-4 flex items-center">
                <Icon name="Library" size={24} className="mr-2" />
                Библиотека сохранённых игр
              </h3>
              <p className="text-muted-foreground text-center py-8">
                Здесь будут храниться ваши любимые игры
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="examples" className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-black mb-3">
                💡 Популярные шаблоны
              </h2>
              <p className="text-lg text-muted-foreground">
                Нажмите на карточку чтобы начать
              </p>
            </div>
              
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {EXAMPLE_PROMPTS.map((example, idx) => (
                <div
                  key={idx}
                  className="group relative p-6 bg-gradient-to-br from-card/90 to-card/50 rounded-2xl border-2 border-primary/20 hover:border-primary/60 transition-all cursor-pointer hover:scale-105 hover:shadow-2xl backdrop-blur-xl"
                  onClick={() => loadExample(example.prompt, example.complexity)}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${example.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity`}></div>
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-black text-xl">{example.title}</h4>
                      <Badge className={`bg-gradient-to-r ${example.gradient} text-white border-0`}>
                        ★ {example.complexity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{example.prompt}</p>
                    
                    <div className="mt-4 pt-4 border-t border-primary/20">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Нажмите для загрузки</span>
                        <Icon name="ArrowRight" size={14} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card className="p-6 bg-card/80 backdrop-blur neon-border">
              <h3 className="text-2xl font-bold mb-4 flex items-center">
                <Icon name="Settings" size={24} className="mr-2" />
                Настройки генератора
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="font-bold mb-2 block">Язык программирования</label>
                  <select className="w-full p-3 bg-input/50 border border-primary/30 rounded-lg text-foreground">
                    <option>HTML5 + JavaScript</option>
                    <option>Python (Pygame)</option>
                    <option>TypeScript</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold mb-2 block">Стиль экспорта</label>
                  <select className="w-full p-3 bg-input/50 border border-primary/30 rounded-lg text-foreground">
                    <option>Единый HTML файл</option>
                    <option>Отдельные файлы (HTML, CSS, JS)</option>
                    <option>ZIP архив</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-input/30 rounded-lg">
                  <span className="font-bold">Социальное сохранение</span>
                  <Badge className="bg-secondary">Скоро</Badge>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <Card className="p-6 bg-card/80 backdrop-blur neon-border">
              <h3 className="text-2xl font-bold mb-4 flex items-center">
                <Icon name="User" size={24} className="mr-2" />
                Профиль разработчика
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                    <Icon name="User" size={40} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold">Game Master</h4>
                    <p className="text-muted-foreground">Создатель игр</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-input/30 rounded-lg border border-primary/20">
                    <p className="text-3xl font-bold text-primary">{gameHistory.length}</p>
                    <p className="text-sm text-muted-foreground">Игр создано</p>
                  </div>
                  <div className="p-4 bg-input/30 rounded-lg border border-accent/20">
                    <p className="text-3xl font-bold text-accent">0</p>
                    <p className="text-sm text-muted-foreground">Сохранено</p>
                  </div>
                  <div className="p-4 bg-input/30 rounded-lg border border-secondary/20">
                    <p className="text-3xl font-bold text-secondary">0</p>
                    <p className="text-sm text-muted-foreground">Опубликовано</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;