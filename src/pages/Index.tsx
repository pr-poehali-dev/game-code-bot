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
  { title: 'Змейка', prompt: 'Создай классическую игру змейка с управлением стрелками', complexity: 2 },
  { title: 'Крестики-нолики', prompt: 'Игра крестики-нолики 3x3 против компьютера', complexity: 1 },
  { title: 'Flappy Bird', prompt: 'Игра как Flappy Bird с препятствиями', complexity: 3 },
  { title: 'Платформер', prompt: 'Простой 2D платформер с прыжками и монетами', complexity: 4 },
  { title: 'Пинг-понг', prompt: 'Классический пинг-понг на двоих игроков', complexity: 2 },
  { title: 'Memory Game', prompt: 'Игра на память с переворачивающимися карточками', complexity: 1 }
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
    if (!prompt.trim()) {
      toast.error('Введите описание игры');
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
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 neon-text">
            <Icon name="Gamepad2" className="inline-block mr-3" size={48} />
            GAME GENERATOR AI
          </h1>
          <p className="text-xl text-muted-foreground flex items-center justify-center gap-2">
            Создавай игры через промпт за секунды
            <Badge variant="outline" className="border-accent text-accent">Powered by Gemini</Badge>
          </p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8 bg-card/50 backdrop-blur neon-border">
            <TabsTrigger value="generator">
              <Icon name="Sparkles" size={18} className="mr-2" />
              Генератор
            </TabsTrigger>
            <TabsTrigger value="history">
              <Icon name="History" size={18} className="mr-2" />
              История
            </TabsTrigger>
            <TabsTrigger value="library">
              <Icon name="Library" size={18} className="mr-2" />
              Библиотека
            </TabsTrigger>
            <TabsTrigger value="examples">
              <Icon name="Lightbulb" size={18} className="mr-2" />
              Примеры
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Icon name="Settings" size={18} className="mr-2" />
              Настройки
            </TabsTrigger>
            <TabsTrigger value="profile">
              <Icon name="User" size={18} className="mr-2" />
              Профиль
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="space-y-6">
            <Card className="p-6 bg-card/80 backdrop-blur neon-border">
              <div className="space-y-6">
                <div>
                  <label className="text-lg font-bold mb-2 block flex items-center">
                    <Icon name="MessageSquare" size={20} className="mr-2" />
                    AI-Промпт
                  </label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Опишите игру которую хотите создать..."
                    className="min-h-32 bg-input/50 border-primary/30 focus:border-primary text-foreground"
                  />
                </div>

                <div>
                  <label className="text-lg font-bold mb-2 block flex items-center justify-between">
                    <span className="flex items-center">
                      <Icon name="Gauge" size={20} className="mr-2" />
                      Сложность
                    </span>
                    <Badge variant="outline" className="border-primary text-primary">
                      Уровень {complexity[0]}
                    </Badge>
                  </label>
                  <Slider
                    value={complexity}
                    onValueChange={setComplexity}
                    min={1}
                    max={5}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>Простая</span>
                    <span>Средняя</span>
                    <span>Сложная</span>
                  </div>
                </div>

                <Button
                  onClick={generateGame}
                  disabled={isGenerating}
                  className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/80 neon-border"
                >
                  {isGenerating ? (
                    <>
                      <Icon name="Loader2" className="mr-2 animate-spin" size={24} />
                      Gemini генерирует игру...
                    </>
                  ) : (
                    <>
                      <Icon name="Zap" className="mr-2" size={24} />
                      Сгенерировать игру
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {currentGame && (
              <Card className="p-6 bg-card/80 backdrop-blur neon-border animate-fade-in">
                <h3 className="text-2xl font-bold mb-4 flex items-center">
                  <Icon name="Code2" size={24} className="mr-2" />
                  Код игры готов!
                </h3>
                
                <div className="bg-input/50 p-4 rounded-lg border border-primary/30 mb-4 max-h-64 overflow-auto">
                  <pre className="text-sm text-foreground/80 font-mono whitespace-pre-wrap break-words">
                    {currentGame.code}
                  </pre>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={playGame}
                    className="flex-1 h-12 text-lg font-bold bg-accent hover:bg-accent/80 neon-border"
                  >
                    <Icon name="Play" className="mr-2" size={20} />
                    Играть
                  </Button>
                  <Button
                    onClick={copyCode}
                    variant="outline"
                    className="flex-1 h-12 text-lg font-bold border-secondary hover:bg-secondary/20"
                  >
                    <Icon name="Copy" className="mr-2" size={20} />
                    Копировать
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

          <TabsContent value="examples" className="space-y-4">
            <Card className="p-6 bg-card/80 backdrop-blur neon-border">
              <h3 className="text-2xl font-bold mb-4 flex items-center">
                <Icon name="Lightbulb" size={24} className="mr-2" />
                Шаблоны и примеры
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {EXAMPLE_PROMPTS.map((example, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-input/30 rounded-lg border border-primary/20 hover:border-primary/50 transition cursor-pointer hover:scale-105"
                    onClick={() => loadExample(example.prompt, example.complexity)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg">{example.title}</h4>
                      <Badge variant="outline" className="border-accent text-accent">
                        Ур. {example.complexity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{example.prompt}</p>
                  </div>
                ))}
              </div>
            </Card>
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