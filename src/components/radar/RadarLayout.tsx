import {
  File,
  Home,
  LineChart,
  ListFilter,
  MoreHorizontal,
  Package,
  Package2,
  PanelLeft,
  PlusCircle,
  Search,
  Settings,
  ShoppingCart,
  Users2,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "../../ui/breadcrumb";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../../ui/card";
import { Input } from "../../ui/input";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "../../ui/table";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Badge } from "../../ui/badge";
import { Link } from "../../ui/link";

export function RadarLayout() {
  return (
    <div className="ab-flex ab-w-full ab-h-full ab-flex-col ab-bg-muted/40">
      <div className="ab-flex ab-h-full ab-flex-col sm:ab-gap-1 sm:ab-py-4 sm:ab-pl-4">
        <header className="ab-sticky ab-top-4 ab-z-30 ab-flex ab-h-14 ab-items-center ab-gap-2 ab-border-b bg-background sm:ab-static sm:ab-h-auto sm:ab-border-0 sm:ab-bg-transparent">
          <Breadcrumb className="ab-hidden md:ab-flex">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link>All</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link>Pressemitteilungen</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Tech</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ab-relative ab-ml-auto ab-flex-1 md:ab-grow-0">
            <Search className="ab-absolute ab-left-2.5 ab-top-2.5 ab-h-4 ab-w-4 ab-text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="ab-w-full ab-rounded-lg ab-pl-8 md:ab-w-[200px] lg:ab-w-[336px]"
            />
          </div>
        </header>
        <main className="ab-grid ab-flex-1 ab-items-start ab-gap-2 ab-p-2 sm:ab-py-0 md:ab-gap-2">
          <Tabs defaultValue="all" className="ab-h-full">
            <div className="ab-flex ab-items-center">
              <TabsList>
                <TabsTrigger className="ab-ftr-menu-item" value="all">
                  Latest
                </TabsTrigger>
                <TabsTrigger className="ab-ftr-active-menu-item" value="active">
                  Trending
                </TabsTrigger>
                <TabsTrigger className="ab-ftr-menu-item" value="draft">
                  Week
                </TabsTrigger>
                <TabsTrigger className="ab-ftr-menu-item" value="archived">
                  Archived
                </TabsTrigger>
              </TabsList>
              <div className="ab-ml-auto ab-flex ab-items-center ab-gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ab-h-8 ab-gap-1"
                    >
                      <ListFilter className="ab-h-3.5 ab-w-3.5" />
                      <span className="ab-sr-only sm:ab-not-sr-only sm:ab-whitespace-nowrap">
                        Filter
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="ab-z-[2147483646]"
                  >
                    <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked>
                      Active
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Draft</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>
                      Archived
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {/*
                <Button size="sm" variant="outline" className="ab-h-8 ab-gap-1">
                  <File className="ab-h-3.5 ab-w-3.5" />
                  <span className="ab-sr-only sm:ab-not-sr-only sm:ab-whitespace-nowrap">
                    Export
                  </span>
                </Button>
                */}
                <Button size="sm" className="ab-h-8 ab-gap-1">
                  <PlusCircle className="ab-h-3.5 ab-w-3.5" />
                  <span className="ab-sr-only sm:ab-not-sr-only sm:ab-whitespace-nowrap">
                    Add News Source
                  </span>
                </Button>
              </div>
            </div>
            <TabsContent value="all" className="ab-h-full">
              <Card x-chunk="dashboard-06-chunk-0" className="ab-h-full">
                <CardContent className="ab-h-full">
                  <Table className="ab-h-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="ab-hidden md:ab-table-cell">
                          Source
                        </TableHead>
                        <TableHead className="ab-hidden md:ab-table-cell">
                          Frequency
                        </TableHead>
                        <TableHead className="ab-hidden md:ab-table-cell">
                          Published at
                        </TableHead>
                        <TableHead>
                          <span className="ab-sr-only">Actions</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="ab-font-medium">
                          Laser Lemonade Machine
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">Trending</Badge>
                        </TableCell>
                        <TableCell className="ab-hidden md:ab-table-cell">
                          n-tv
                        </TableCell>
                        <TableCell className="ab-hidden md:ab-table-cell">
                          25
                        </TableCell>
                        <TableCell className="ab-hidden md:ab-table-cell">
                          2024-07-12 10:42 AM
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                aria-haspopup="true"
                                size="icon"
                                variant="ghost"
                              >
                                <MoreHorizontal className="ab-h-4 ab-w-4" />
                                <span className="ab-sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="ab-z-[2147483646]"
                            >
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="ab-font-medium">
                          Hypernova Headphones
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">Trending</Badge>
                        </TableCell>
                        <TableCell className="ab-hidden md:ab-table-cell">
                          TechCrunch
                        </TableCell>
                        <TableCell className="ab-hidden md:ab-table-cell">
                          100
                        </TableCell>
                        <TableCell className="ab-hidden md:ab-table-cell">
                          2024-10-18 03:21 PM
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                aria-haspopup="true"
                                size="icon"
                                variant="ghost"
                              >
                                <MoreHorizontal className="ab-h-4 ab-w-4" />
                                <span className="ab-sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="ab-z-[2147483646]"
                            >
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="ab-font-medium">
                          AeroGlow Desk Lamp
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="ab-mr-1">
                            Trending
                          </Badge>
                          <Badge variant="outline">Trend-Follow-Up</Badge>
                        </TableCell>
                        <TableCell className="ab-hidden md:ab-table-cell">
                          The Verge
                        </TableCell>
                        <TableCell className="ab-hidden md:ab-table-cell">
                          50
                        </TableCell>
                        <TableCell className="ab-hidden md:ab-table-cell">
                          2024-11-29 08:15 AM
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                aria-haspopup="true"
                                size="icon"
                                variant="ghost"
                              >
                                <MoreHorizontal className="ab-h-4 ab-w-4" />
                                <span className="ab-sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="ab-z-[2147483646]"
                            >
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="ab-font-medium">
                          TechTonic Energy Drink
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="ab-mr-1">
                            Trending
                          </Badge>
                          <Badge variant="outline">Trend-Follow-Up</Badge>
                        </TableCell>
                        <TableCell className="ab-hidden md:ab-table-cell">
                          Wired
                        </TableCell>
                        <TableCell className="ab-hidden md:ab-table-cell">
                          0
                        </TableCell>
                        <TableCell className="ab-hidden md:ab-table-cell">
                          2024-12-25 11:59 PM
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                aria-haspopup="true"
                                size="icon"
                                variant="ghost"
                              >
                                <MoreHorizontal className="ab-h-4 ab-w-4" />
                                <span className="ab-sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="ab-z-[2147483646]"
                            >
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="ab-font-medium">
                          Gamer Gear Pro Controller
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">Trending</Badge>
                        </TableCell>
                        <TableCell className="ab-hidden md:ab-table-cell">
                          Polygon
                        </TableCell>
                        <TableCell className="ab-hidden md:ab-table-cell">
                          75
                        </TableCell>
                        <TableCell className="ab-hidden md:ab-table-cell">
                          2024-01-01 12:00 AM
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                aria-haspopup="true"
                                size="icon"
                                variant="ghost"
                              >
                                <MoreHorizontal className="ab-h-4 ab-w-4" />
                                <span className="ab-sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="ab-z-[2147483646]"
                            >
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="ab-font-medium">
                          Luminous VR Headset
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">Trending</Badge>
                        </TableCell>
                        <TableCell className="ab-hidden md:ab-table-cell">
                          The Guardian
                        </TableCell>
                        <TableCell className="ab-hidden md:ab-table-cell">
                          30
                        </TableCell>
                        <TableCell className="ab-hidden md:ab-table-cell">
                          2024-02-14 02:14 PM
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                aria-haspopup="true"
                                size="icon"
                                variant="ghost"
                              >
                                <MoreHorizontal className="ab-h-4 ab-w-4" />
                                <span className="ab-sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="ab-z-[2147483646]"
                            >
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter>
                  <div className="ab-text-xs ab-text-muted-foreground">
                    Showing <strong>1-10</strong> of <strong>32</strong> news
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
